// Imports the cleaned recipe dataset (built by build-prod-dataset.ts) into any database.
// Dry run by default: it only reads and prints what would change.
// Usage: npx ts-node --transpile-only prisma/import-prod-recipes.ts <respo-prod.json> [--apply] [--allow-remote]
// DATABASE_URL comes from the environment (or backend/.env when not set).
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ProductCategory, RecipeCategory } from '../src/generated/prisma';

interface Macros {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
}

interface DatasetIngredient {
    name: string;
    grams: number;
    per100g: Macros;
    category: ProductCategory;
}

interface DatasetRecipe {
    name: string;
    categories: RecipeCategory[];
    steps: string[];
    ingredients: DatasetIngredient[];
}

const normalize = (name: string): string => name.trim().toLowerCase();

// Prisma turns raw JS numbers into binary-drifted Decimals (9.7 -> 9.6999...), so pass strings
const toDecimalString = (value: number): string => value.toString();

const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

// Returns the host only, so the password in the URL never reaches the logs
const getDatabaseHost = (url: string | undefined): string => {
    if (!url) throw new Error('DATABASE_URL is not set');
    return new URL(url).hostname;
};

const main = async (): Promise<void> => {
    const [datasetPath] = process.argv.slice(2);
    const apply = process.argv.includes('--apply');
    const allowRemote = process.argv.includes('--allow-remote');

    const host = getDatabaseHost(process.env.DATABASE_URL);
    if (!LOCAL_HOSTS.includes(host) && !allowRemote) {
        throw new Error(`"${host}" is not a local database, pass --allow-remote to continue`);
    }
    console.log(`Database host: ${host} | mode: ${apply ? 'APPLY' : 'dry run'}`);

    const recipes = (JSON.parse(readFileSync(datasetPath, 'utf8')) as { recipes: DatasetRecipe[] }).recipes;
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

    // 1. Unique ingredients across all recipes (first occurrence wins)
    const ingredientsByKey = new Map<string, DatasetIngredient>();
    for (const recipe of recipes) {
        for (const ingredient of recipe.ingredients) {
            if (!ingredientsByKey.has(normalize(ingredient.name))) {
                ingredientsByKey.set(normalize(ingredient.name), ingredient);
            }
        }
    }

    // 2. Reuse existing products by name, create the rest with client-side ids
    const existingProducts = await prisma.product.findMany({ select: { id: true, name: true, calories: true } });
    const productByKey = new Map(existingProducts.map((product) => [normalize(product.name), product]));
    const productIdByKey = new Map(existingProducts.map((product) => [normalize(product.name), product.id]));

    const newProducts = [...ingredientsByKey.entries()]
        .filter(([key]) => !productIdByKey.has(key))
        .map(([key, ingredient]) => {
            const id = randomUUID();
            productIdByKey.set(key, id);
            return {
                id,
                name: ingredient.name,
                calories: toDecimalString(ingredient.per100g.kcal),
                protein: toDecimalString(ingredient.per100g.protein),
                fat: toDecimalString(ingredient.per100g.fat),
                carbs: toDecimalString(ingredient.per100g.carbs),
                category: ingredient.category,
            };
        });

    // Reused products keep their own macros, so flag the ones that differ noticeably
    const macroMismatches = [...ingredientsByKey.entries()]
        .filter(([key]) => productByKey.has(key))
        .map(([key, ingredient]) => ({
            name: ingredient.name,
            database: Number(productByKey.get(key)!.calories),
            dataset: ingredient.per100g.kcal,
        }))
        .filter((row) => Math.abs(row.database - row.dataset) > 5);

    // 3. Skip recipes whose name already exists, so the script is safe to re-run
    const existingRecipes = await prisma.recipe.findMany({ select: { name: true } });
    const takenNames = new Set(existingRecipes.map((recipe) => normalize(recipe.name)));
    const recipesToCreate = recipes.filter((recipe) => !takenNames.has(normalize(recipe.name)));

    const recipeRows = recipesToCreate.map((recipe) => ({
        id: randomUUID(),
        name: recipe.name,
        steps: recipe.steps,
        categories: recipe.categories,
    }));
    const ingredientRows = recipesToCreate.flatMap((recipe, index) =>
        recipe.ingredients.map((ingredient) => ({
            recipeId: recipeRows[index].id,
            productId: productIdByKey.get(normalize(ingredient.name))!,
            quantity: toDecimalString(ingredient.grams),
        })),
    );

    console.log(`Products: ${ingredientsByKey.size - newProducts.length} reused, ${newProducts.length} new`);
    console.log(
        `Recipes: ${recipesToCreate.length} new, ${recipes.length - recipesToCreate.length} skipped (name exists)`,
    );
    console.log(`Recipe ingredients: ${ingredientRows.length}`);
    if (macroMismatches.length > 0) {
        console.log('Reused products with different kcal (database vs dataset):');
        macroMismatches.forEach((row) => console.log(`  ${row.name}: ${row.database} vs ${row.dataset}`));
    }

    if (!apply) {
        console.log('Dry run, nothing written. Re-run with --apply to import.');
        await prisma.$disconnect();
        return;
    }

    // 4. Three bulk inserts in one transaction: all or nothing, and few round trips to a remote DB
    await prisma.$transaction(
        async (tx) => {
            await tx.product.createMany({ data: newProducts });
            await tx.recipe.createMany({ data: recipeRows });
            await tx.recipeIngredient.createMany({ data: ingredientRows });
        },
        { timeout: 120_000 },
    );

    console.log('Import done');
    await prisma.$disconnect();
};

main().catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
});
