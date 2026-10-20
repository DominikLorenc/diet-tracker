// Builds the ONLY file meant for a production import: own steps instead of Respo's,
// every text cleaned of HTML and whitespace junk, and a final check that fails loudly.
// Usage: npx ts-node --transpile-only prisma/build-prod-dataset.ts <recipes.json> <own-steps.json> \
//          <ingredient-categories.json> <recipe-categories.json> <output.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { ProductCategory, RecipeCategory } from '../src/generated/prisma';

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
}

interface ProdIngredient {
    name: string;
    grams: number;
    per100g: Macros;
    category: ProductCategory;
}

interface ProdRecipe {
    name: string;
    categories: RecipeCategory[];
    steps: string[];
    ingredients: ProdIngredient[];
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;

// Strips tags (e.g. Respo's <b>), turns non-breaking and zero-width spaces into normal ones,
// collapses runs of whitespace and trims, so the same name always compares equal
const cleanText = (value: string): string =>
    value
        .replace(/<[^>]*>/g, '')
        .replace(/[\u00a0\u200b\u2028\u2029\ufeff]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const FORBIDDEN = /[<>]|&[a-zA-Z]+;|&#\d+;/;

const assertClean = (label: string, value: string): void => {
    if (value.length === 0) throw new Error(`Empty ${label}`);
    if (FORBIDDEN.test(value)) throw new Error(`Markup left in ${label}: "${value}"`);
};

const main = (): void => {
    const [recipesPath, stepsPath, ingredientCategoriesPath, recipeCategoriesPath, outputPath] = process.argv.slice(2);

    const recipes = readJson<{ recipes: RespoRecipe[] }>(recipesPath).recipes;
    const ownSteps = readJson<Record<string, string[]>>(stepsPath);
    const ingredientCategories = readJson<Record<string, ProductCategory>>(ingredientCategoriesPath);
    const recipeCategories = readJson<Record<string, RecipeCategory[]>>(recipeCategoriesPath);

    // Lookup maps keyed by cleaned names, so stray spaces in any source file cannot break a match
    const stepsByName = new Map(Object.entries(ownSteps).map(([name, steps]) => [cleanText(name), steps]));
    const ingredientCategoryByName = new Map(
        Object.entries(ingredientCategories).map(([name, category]) => [cleanText(name), category]),
    );
    const recipeCategoriesByName = new Map(
        Object.entries(recipeCategories).map(([name, categories]) => [cleanText(name), categories]),
    );

    const seen = new Set<string>();
    const result: ProdRecipe[] = [];

    for (const recipe of recipes) {
        const name = cleanText(recipe.name);
        if (seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());

        const steps = stepsByName.get(name);
        if (!steps) throw new Error(`No own steps for "${name}"`);

        const ingredients = recipe.ingredients
            // Group headers like "Sos:" carry no macros and are not real ingredients
            .filter((ingredient) => ingredient.per100g !== null && ingredient.grams > 0)
            .map((ingredient) => {
                const ingredientName = cleanText(ingredient.name);
                return {
                    name: ingredientName,
                    grams: ingredient.grams,
                    per100g: ingredient.per100g!,
                    category: ingredientCategoryByName.get(ingredientName) ?? ProductCategory.OTHER,
                };
            });

        result.push({
            name,
            categories: recipeCategoriesByName.get(name) ?? [],
            steps: steps.map(cleanText).filter((step) => step.length > 0),
            ingredients,
        });
    }

    // Final gate: every text that will reach the database is checked once more
    for (const recipe of result) {
        assertClean('recipe name', recipe.name);
        recipe.steps.forEach((step) => assertClean(`step of "${recipe.name}"`, step));
        recipe.ingredients.forEach((ingredient) => assertClean(`ingredient of "${recipe.name}"`, ingredient.name));
    }

    writeFileSync(outputPath, JSON.stringify({ recipeCount: result.length, recipes: result }, null, 2));

    const withoutCategories = result.filter((recipe) => recipe.categories.length === 0).length;
    console.log(`Recipes: ${result.length}, without categories: ${withoutCategories}`);
    console.log(`Steps: ${result.reduce((sum, recipe) => sum + recipe.steps.length, 0)}`);
    console.log(`Written to ${outputPath}`);
};

main();
