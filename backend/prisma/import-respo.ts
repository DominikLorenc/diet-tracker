// One-off import of the Respo recipe export into the LOCAL dev database.
// Usage: npx ts-node --transpile-only prisma/import-respo.ts <recipes.json> <categories.json> [--dry-run]
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ProductCategory } from '../src/generated/prisma';

interface Macros {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
}

interface RespoIngredient {
    name: string;
    grams: number;
    per100g: Macros | null;
}

interface RespoRecipe {
    name: string;
    ingredients: RespoIngredient[];
    instructions: string[];
}

interface RespoExport {
    recipes: RespoRecipe[];
}

const normalize = (name: string): string => name.trim().toLowerCase();

// Prisma turns raw JS numbers into binary-drifted Decimals (9.7 -> 9.6999...), so pass strings
const toDecimalString = (value: number): string => value.toString();

const assertLocalDatabase = (url: string | undefined): void => {
    const host = url ? new URL(url).hostname : '';
    if (host !== 'localhost' && host !== '127.0.0.1') {
        throw new Error(`Refusing to import into non-local database host "${host}"`);
    }
};

const main = async (): Promise<void> => {
    const [recipesPath, categoriesPath] = process.argv.slice(2);
    const dryRun = process.argv.includes('--dry-run');
    assertLocalDatabase(process.env.DATABASE_URL);

    const data = JSON.parse(readFileSync(recipesPath, 'utf8')) as RespoExport;
    const categories = JSON.parse(readFileSync(categoriesPath, 'utf8')) as Record<string, ProductCategory>;

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

    // 1. Collect unique real ingredients (group headers have no macros)
    const ingredientsByKey = new Map<string, RespoIngredient>();
    for (const recipe of data.recipes) {
        for (const ingredient of recipe.ingredients) {
            if (ingredient.per100g && !ingredientsByKey.has(normalize(ingredient.name))) {
                ingredientsByKey.set(normalize(ingredient.name), ingredient);
            }
        }
    }

    // 2. Reuse existing products by trimmed, case-insensitive name; create the rest
    const existingProducts = await prisma.product.findMany({ select: { id: true, name: true } });
    const productIdByKey = new Map(existingProducts.map((product) => [normalize(product.name), product.id]));
    const reused = [...ingredientsByKey.keys()].filter((key) => productIdByKey.has(key));
    const newProducts = [...ingredientsByKey.entries()]
        .filter(([key]) => !productIdByKey.has(key))
        .map(([, ingredient]) => ({
            name: ingredient.name.trim(),
            calories: toDecimalString(ingredient.per100g!.kcal),
            protein: toDecimalString(ingredient.per100g!.protein),
            fat: toDecimalString(ingredient.per100g!.fat),
            carbs: toDecimalString(ingredient.per100g!.carbs),
            category: categories[ingredient.name.trim()] ?? ProductCategory.OTHER,
        }));

    // 3. Skip recipes whose name already exists (in DB or earlier in the file)
    const existingRecipes = await prisma.recipe.findMany({ select: { name: true } });
    const takenNames = new Set(existingRecipes.map((recipe) => normalize(recipe.name)));
    const recipesToCreate = data.recipes.filter((recipe) => {
        const key = normalize(recipe.name);
        if (takenNames.has(key)) return false;
        takenNames.add(key);
        return true;
    });

    console.log(`Products: ${reused.length} reused, ${newProducts.length} new`);
    console.log(`Reused: ${reused.join(', ')}`);
    console.log(`Recipes: ${recipesToCreate.length} new, ${data.recipes.length - recipesToCreate.length} skipped`);
    if (dryRun) {
        await prisma.$disconnect();
        return;
    }

    // 4. Everything in one transaction, so a failure leaves no half-imported data
    await prisma.$transaction(
        async (tx) => {
            await tx.product.createMany({ data: newProducts });
            const allProducts = await tx.product.findMany({ select: { id: true, name: true } });
            for (const product of allProducts) {
                if (!productIdByKey.has(normalize(product.name))) {
                    productIdByKey.set(normalize(product.name), product.id);
                }
            }

            for (const recipe of recipesToCreate) {
                await tx.recipe.create({
                    data: {
                        name: recipe.name.trim(),
                        steps: recipe.instructions,
                        products: {
                            create: recipe.ingredients
                                .filter((ingredient) => ingredient.per100g && ingredient.grams > 0)
                                .map((ingredient) => ({
                                    productId: productIdByKey.get(normalize(ingredient.name))!,
                                    quantity: toDecimalString(ingredient.grams),
                                })),
                        },
                    },
                });
            }
        },
        { timeout: 300_000 },
    );

    console.log('Import done');
    await prisma.$disconnect();
};

main().catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
});
