// One-off fill of Recipe.categories from the reviewed category map, LOCAL dev database only.
// Usage: npx ts-node --transpile-only prisma/fill-recipe-categories.ts <categories.json> [--dry-run]
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, RecipeCategory } from '../src/generated/prisma';

const assertLocalDatabase = (url: string | undefined): void => {
    const host = url ? new URL(url).hostname : '';
    if (host !== 'localhost' && host !== '127.0.0.1') {
        throw new Error(`Refusing to write to non-local database host "${host}"`);
    }
};

const main = async (): Promise<void> => {
    const [categoriesPath] = process.argv.slice(2);
    const dryRun = process.argv.includes('--dry-run');
    assertLocalDatabase(process.env.DATABASE_URL);

    const categoriesByName = JSON.parse(readFileSync(categoriesPath, 'utf8')) as Record<string, RecipeCategory[]>;
    const validCategories = new Set<string>(Object.values(RecipeCategory));

    // Fail fast on a typo in the JSON instead of letting Postgres reject it mid-transaction
    const invalid = Object.entries(categoriesByName).filter(([, categories]) =>
        categories.some((category) => !validCategories.has(category)),
    );
    if (invalid.length > 0) {
        throw new Error(`Unknown categories in: ${invalid.map(([name]) => name).join(', ')}`);
    }

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

    const recipes = await prisma.recipe.findMany({ select: { id: true, name: true } });
    const matched = recipes.filter((recipe) => categoriesByName[recipe.name.trim()]);
    const unmatched = recipes.filter((recipe) => !categoriesByName[recipe.name.trim()]);

    console.log(
        `Recipes in DB: ${recipes.length}, matched: ${matched.length}, without categories: ${unmatched.length}`,
    );
    console.log(`Without categories: ${unmatched.map((recipe) => recipe.name).join(', ')}`);
    if (dryRun) {
        await prisma.$disconnect();
        return;
    }

    await prisma.$transaction(
        matched.map((recipe) =>
            prisma.recipe.update({
                where: { id: recipe.id },
                data: { categories: categoriesByName[recipe.name.trim()] },
            }),
        ),
    );

    console.log('Categories filled');
    await prisma.$disconnect();
};

main().catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
});
