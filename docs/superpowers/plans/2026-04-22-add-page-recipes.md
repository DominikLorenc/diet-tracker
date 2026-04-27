# Zakładka Przepisy — UserRecipe + GlobalRecipe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Przebudować zakładkę "Przepisy" na `/dashboard/add` tak, żeby pokazywała dwie sekcje — przepisy użytkownika (UserRecipe) i globalne (Recipe) — z kopiowaniem, usuwaniem, dodawaniem do dziennika i edycją; recipe-builder staje się role-aware z trybem edycji.

**Architecture:** Backend dostaje jedno nowe pole `userRecipeId` na `DiaryEntryItem` (migracja Prisma + aktualizacja serwisu). Frontend: `RecipeCard` zyskuje opcjonalny prop `onCopy`, pojawia się nowy `UserRecipeCard`, `RecipeSearch` dzieli się na dwie sekcje, a `recipe-builder` wykrywa rolę z `/users/me` i obsługuje `?id=` w URL.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, openapi-fetch, Prisma 5, Express, Vitest, Supertest

---

## File Map

**Modyfikowane:**
- `backend/prisma/schema.prisma` — `userRecipeId String?` + relacja na `DiaryEntryItem`
- `backend/src/schemas/diarySchema.ts` — `userRecipeId: z.uuid().optional()` w schemacie Zod
- `backend/src/services/diaryService.ts` — `userRecipeId?: string` w `AddDiaryEntryInput`, przekazywane dalej
- `backend/src/__tests__/diary.test.ts` — nowy test POST /diary z userRecipeId
- `frontend/app/_components/add/RecipeCard.tsx` — props `onCopy` i `isCopied`
- `frontend/app/_components/add/RecipeSearch.tsx` — pełny refaktor: dwie sekcje, 3 fetche
- `frontend/app/dashboard/recipe-builder/page.tsx` — role-aware + tryb edycji `?id=`
- `frontend/src/lib/api/schema.d.ts` — regenerowany po zmianach backendu

**Tworzone:**
- `frontend/app/_components/add/UserRecipeCard.tsx`

---

## Task 1: Backend — DiaryEntryItem + userRecipeId

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/schemas/diarySchema.ts`
- Modify: `backend/src/services/diaryService.ts`
- Modify: `backend/src/__tests__/diary.test.ts`

- [ ] **Step 1: Napisz failing test**

Dodaj nowy test do istniejącego bloku `describe('POST /api/v1/diary', ...)` w `backend/src/__tests__/diary.test.ts`:

```typescript
it('should accept userRecipeId in body and call service with it', async () => {
    const userRecipeId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
    vi.mocked(addDiaryService).mockResolvedValue({
        id: '1',
        date: new Date(),
        userId,
        createdAt: new Date(),
    });
    const res = await request(app)
        .post('/api/v1/diary')
        .send({
            date: new Date().toISOString(),
            userRecipeId,
            quantity: 1,
            mealType: 'BREAKFAST',
        })
        .set('Cookie', ['token=' + token]);
    expect(res.status).toBe(201);
    expect(addDiaryService).toHaveBeenCalledWith(
        expect.objectContaining({ userRecipeId }),
    );
});
```

- [ ] **Step 2: Uruchom test — oczekuj FAIL**

```bash
cd "backend" && npm test -- --reporter=verbose 2>&1 | tail -30
```

Oczekiwany wynik: test FAIL — `expect.objectContaining({ userRecipeId })` nie jest spełnione, bo `userRecipeId` jest filtrowane przez schemat Zod.

- [ ] **Step 3: Dodaj `userRecipeId` do schematu Zod w `backend/src/schemas/diarySchema.ts`**

```typescript
import { z } from 'zod';
import { registry } from '../swagger';

export const diaryEntrySchema = registry.register(
    'DiaryEntry',
    z.object({
        date: z.coerce.date(),
        mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
        productId: z.uuid().optional(),
        recipeId: z.uuid().optional(),
        userRecipeId: z.uuid().optional(),
        quantity: z.number().min(0),
    }),
);

export const dateDiarySchema = z.object({
    date: z.coerce.date(),
});

export const diaryIdSchema = z.uuid();
```

- [ ] **Step 4: Dodaj `userRecipeId` do `AddDiaryEntryInput` i przekaż dalej w `backend/src/services/diaryService.ts`**

Zamień typ `AddDiaryEntryInput` i oba miejsca gdzie tworzymy item:

```typescript
type AddDiaryEntryInput = {
    userId: string;
    date: Date;
    productId?: string;
    recipeId?: string;
    userRecipeId?: string;
    quantity: number;
    mealType: MealType;
};
```

W `addDiaryService`, w bloku `if (entryExist)`:
```typescript
await createDiaryItem({
    diaryEntryId: entryExist.id,
    productId: entry?.productId,
    recipeId: entry?.recipeId,
    userRecipeId: entry?.userRecipeId,
    quantity: entry.quantity,
    mealType: entry?.mealType,
});
```

W bloku `prisma.diaryEntry.create`:
```typescript
items: {
    create: {
        productId: entry.productId,
        recipeId: entry.recipeId,
        userRecipeId: entry.userRecipeId,
        quantity: entry.quantity,
        mealType: entry.mealType,
    },
},
```

- [ ] **Step 5: Uruchom test — oczekuj PASS**

```bash
cd "backend" && npm test -- --reporter=verbose 2>&1 | tail -30
```

Oczekiwany wynik: wszystkie testy PASS (włącznie z nowym).

- [ ] **Step 6: Dodaj `userRecipeId` do modelu `DiaryEntryItem` w `backend/prisma/schema.prisma`**

Zamień model `DiaryEntryItem`:

```prisma
model DiaryEntryItem {
  id           String     @id @default(uuid())
  diaryEntryId String
  diaryEntry   DiaryEntry @relation(fields: [diaryEntryId], references: [id])
  productId    String?
  product      Product?   @relation(fields: [productId], references: [id])
  recipeId     String?
  recipe       Recipe?    @relation(fields: [recipeId], references: [id])
  userRecipeId String?
  userRecipe   UserRecipe? @relation(fields: [userRecipeId], references: [id])
  mealType     MealType   @default(BREAKFAST)
  createdAt    DateTime   @default(now())
  quantity     Decimal
}
```

Dodaj back-relation do modelu `UserRecipe` (po linii `userRecipeIngredients UserRecipeIngredient[]`):

```prisma
  diaryEntriesItems DiaryEntryItem[]
```

- [ ] **Step 7: Uruchom migrację Prisma**

```bash
cd "backend" && npx prisma migrate dev --name add_user_recipe_id_to_diary_item
```

Oczekiwany wynik: `Your database is now in sync with your schema.`

- [ ] **Step 8: Zregeneruj `frontend/src/lib/api/schema.d.ts`**

Backend musi być uruchomiony (`npm run dev` w osobnym terminalu). Następnie:

```bash
cd "frontend" && npm run generate:api
```

Oczekiwany wynik: plik `frontend/src/lib/api/schema.d.ts` zostaje zaktualizowany. Sprawdź że `DiaryEntry` zawiera `userRecipeId`:

```bash
grep "userRecipeId" "frontend/src/lib/api/schema.d.ts"
```

Oczekiwany wynik: co najmniej 1 linia z `userRecipeId`.

- [ ] **Step 9: Commit**

```bash
git add "backend/prisma/schema.prisma" \
        "backend/prisma/migrations" \
        "backend/src/schemas/diarySchema.ts" \
        "backend/src/services/diaryService.ts" \
        "backend/src/__tests__/diary.test.ts" \
        "frontend/src/lib/api/schema.d.ts"
git commit -m "feat: add userRecipeId to DiaryEntryItem and diary schema"
```

---

## Task 2: RecipeCard — prop onCopy

**Files:**
- Modify: `frontend/app/_components/add/RecipeCard.tsx`

- [ ] **Step 1: Dodaj props `onCopy` i `isCopied` do typu `Props`**

W `frontend/app/_components/add/RecipeCard.tsx`, rozszerz typ `Props`:

```typescript
type Props = {
  recipe: Recipe;
  isFavorite?: boolean;
  onAddToDiary: (recipe: Recipe, portion: number) => Promise<void>;
  onFavoriteToggle?: (recipeId: string, nowFavorite: boolean) => void;
  defaultExpanded?: boolean;
  onCopy?: (recipeId: string) => Promise<void>;
  isCopied?: boolean;
};
```

Dodaj parametry do destructuringu w sygnaturze funkcji `RecipeCard`:

```typescript
export const RecipeCard = ({
  recipe,
  isFavorite = false,
  onAddToDiary,
  onFavoriteToggle,
  defaultExpanded = false,
  onCopy,
  isCopied = false,
}: Props) => {
```

- [ ] **Step 2: Dodaj stan `copying` i handler `handleCopy`**

Po istniejącym `const [adding, setAdding] = useState(false);` dodaj:

```typescript
const [copying, setCopying] = useState(false);

const handleCopy = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setCopying(true);
  await onCopy?.(recipe.id);
  setCopying(false);
};
```

- [ ] **Step 3: Zastąp przycisk serduszka warunkowym renderowaniem**

Zamień cały blok `{/* Przycisk ulubionych */}` (przycisk z `toggleFavorite`) na:

```tsx
{onCopy ? (
  <button
    onClick={handleCopy}
    disabled={copying || isCopied}
    className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-md transition-colors border ${
      isCopied
        ? "bg-[#1A2420] text-[#4A5A4A] border-[#1E3322] cursor-default"
        : copying
        ? "bg-[#1A2820] text-[#4ADE80] border-[#22C55E30] opacity-60"
        : "bg-[#1A2820] text-[#4ADE80] border-[#22C55E30] hover:border-[#22C55E] hover:bg-[#1E3322]"
    }`}
  >
    {copying ? "..." : isCopied ? "Skopiowany" : "Kopiuj"}
  </button>
) : (
  <button
    onClick={toggleFavorite}
    className="shrink-0 transition-colors"
    aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill={favorite ? "#22C55E" : "none"}
      stroke={favorite ? "#22C55E" : "#4A5A4A"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </button>
)}
```

- [ ] **Step 4: Sprawdź TypeScript**

```bash
cd "frontend" && npx tsc --noEmit 2>&1 | grep "RecipeCard"
```

Oczekiwany wynik: brak błędów TypeScript w RecipeCard.tsx.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/_components/add/RecipeCard.tsx"
git commit -m "feat: add onCopy/isCopied props to RecipeCard"
```

---

## Task 3: UserRecipeCard — nowy komponent

**Files:**
- Create: `frontend/app/_components/add/UserRecipeCard.tsx`

- [ ] **Step 1: Utwórz plik `frontend/app/_components/add/UserRecipeCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type UserRecipeIngredient = {
  id: string;
  quantity: string;
  product: {
    id: string;
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
};

export type UserRecipe = {
  id: string;
  name: string;
  createdAt: string;
  sourceRecipeId: string | null;
  userRecipeIngredients: UserRecipeIngredient[];
};

type Props = {
  recipe: UserRecipe;
  onAddToDiary: (recipe: UserRecipe, portion: number) => Promise<void>;
  onDelete: (recipeId: string) => Promise<void>;
};

const calcTotalKcal = (recipe: UserRecipe, portion: number): number =>
  recipe.userRecipeIngredients.reduce((sum, ing) => {
    const qty = parseFloat(ing.quantity);
    const kcal = parseFloat(ing.product.calories);
    return sum + (qty / 100) * kcal * portion;
  }, 0);

export const UserRecipeCard = ({ recipe, onAddToDiary, onDelete }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [portion, setPortion] = useState(1);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalKcal = calcTotalKcal(recipe, portion);

  const handleAdd = async () => {
    setAdding(true);
    await onAddToDiary(recipe, portion);
    setAdding(false);
    setExpanded(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(recipe.id);
    setDeleting(false);
  };

  return (
    <div
      className="rounded-xl border overflow-hidden cursor-pointer mb-2 bg-[#131E15] border-[#1E3322] transition-colors"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Nagłówek karty */}
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Ikona */}
        <div className="w-9 h-9 rounded-lg bg-[#1A2820] shrink-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="#4ADE80"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>

        {/* Nazwa + metadane */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-[#F3F7FF] font-semibold text-sm truncate">
              {recipe.name}
            </p>
            {recipe.sourceRecipeId && (
              <span className="text-[10px] text-[#4ADE80] bg-[#1A2820] border border-[#22C55E30] px-1.5 py-0.5 rounded-full shrink-0">
                skopiowany
              </span>
            )}
          </div>
          <p className="text-[#8FA0B8] text-xs">
            {recipe.userRecipeIngredients.length} składników ·{" "}
            ~{totalKcal.toFixed(0)} kcal
          </p>
        </div>

        {/* Kcal badge */}
        <span className="text-[#F4C65D] font-mono font-bold text-sm shrink-0">
          {totalKcal.toFixed(0)} kcal
        </span>

        {/* Link Edytuj */}
        <Link
          href={`/dashboard/recipe-builder?id=${recipe.id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-[#8FA0B8] hover:text-[#F3F7FF] text-xs transition-colors"
        >
          Edytuj
        </Link>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={15}
          height={15}
          fill="none"
          stroke="#4A5A4A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Panel rozwinięty */}
      {expanded && (
        <div
          className="border-t border-[#1E3322] bg-[#1A2B1F] px-3 py-3 flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lista składników */}
          {recipe.userRecipeIngredients.length > 0 && (
            <div className="flex flex-col gap-1">
              {recipe.userRecipeIngredients.map((ing) => (
                <div key={ing.id} className="flex justify-between text-xs">
                  <span className="text-[#8FA0B8]">{ing.product.name}</span>
                  <span className="text-[#4A5A4A]">{ing.quantity}g</span>
                </div>
              ))}
            </div>
          )}

          <div className="h-px bg-[#1E3322]" />

          {/* Porcje + przycisk dodaj */}
          <div className="flex items-center gap-3">
            <label className="text-[#8FA0B8] text-xs shrink-0">Porcje:</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPortion((p) => Math.max(0.5, p - 0.5))}
                className="w-7 h-7 rounded-lg bg-[#0F1A10] border border-[#1E3322] text-[#8FA0B8] hover:text-white hover:border-[#22C55E] transition-colors flex items-center justify-center text-base leading-none"
              >
                −
              </button>
              <span className="w-8 text-center text-white text-sm font-mono">
                {portion}
              </span>
              <button
                onClick={() => setPortion((p) => p + 0.5)}
                className="w-7 h-7 rounded-lg bg-[#0F1A10] border border-[#1E3322] text-[#8FA0B8] hover:text-white hover:border-[#22C55E] transition-colors flex items-center justify-center text-base leading-none"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="ml-auto bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              {adding ? "Dodaję..." : "Dodaj"}
            </button>
          </div>

          <div className="h-px bg-[#1E3322]" />

          {/* Inline potwierdzenie usunięcia */}
          {confirmDelete ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#8FA0B8]">Na pewno usunąć?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors disabled:opacity-60"
              >
                {deleting ? "Usuwam..." : "Tak"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[#8FA0B8] hover:text-[#F3F7FF] transition-colors"
              >
                Nie
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[#8FA0B8] hover:text-red-400 text-xs transition-colors w-fit"
            >
              Usuń przepis
            </button>
          )}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd "frontend" && npx tsc --noEmit 2>&1 | grep "UserRecipeCard"
```

Oczekiwany wynik: brak błędów TypeScript.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/_components/add/UserRecipeCard.tsx"
git commit -m "feat: add UserRecipeCard component"
```

---

## Task 4: RecipeSearch — refaktor na dwie sekcje

**Files:**
- Modify: `frontend/app/_components/add/RecipeSearch.tsx`

> Wymaga: Task 1 (schema ma `userRecipeId`), Task 2 (RecipeCard ma `onCopy`), Task 3 (UserRecipeCard istnieje).

- [ ] **Step 1: Zastąp całą zawartość `RecipeSearch.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { RecipeCard } from "./RecipeCard";
import { UserRecipeCard, UserRecipe } from "./UserRecipeCard";

type RecipeIngredient = {
  id: string;
  quantity: string;
  product: {
    id: string;
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    imageUrl: string;
    createdAt: string;
  };
};

type Recipe = {
  id: string;
  name: string;
  createdAt: string;
  products: RecipeIngredient[];
};

type RecipeFavorite = {
  id: string;
  recipeId: string;
  recipe: Recipe;
};

const calcGlobalTotalGrams = (recipe: Recipe): number =>
  recipe.products.reduce((sum, ing) => sum + parseFloat(ing.quantity), 0);

const calcUserTotalGrams = (recipe: UserRecipe): number =>
  recipe.userRecipeIngredients.reduce(
    (sum, ing) => sum + parseFloat(ing.quantity),
    0,
  );

export const RecipeSearch = () => {
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);

  const [globalRecipes, setGlobalRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [favorites, setFavorites] = useState<RecipeFavorite[]>([]);
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [recipesRes, userRecipesRes, favRes] = await Promise.all([
        apiClient.GET("/recipes"),
        apiClient.GET("/user-recipes"),
        apiClient.GET("/favorites/recipes"),
      ]);
      if (recipesRes.data)
        setGlobalRecipes(recipesRes.data.recipes as unknown as Recipe[]);
      if (userRecipesRes.data)
        setUserRecipes(
          userRecipesRes.data.userRecipes as unknown as UserRecipe[],
        );
      if (favRes.data)
        setFavorites(favRes.data.favorites as unknown as RecipeFavorite[]);
      setIsLoading(false);
    };
    load();
  }, []);

  const getMealParams = () => ({
    mealType: searchParams.get("mealType"),
    date: searchParams.get("date"),
  });

  const addUserRecipeToDiary = async (recipe: UserRecipe, portion: number) => {
    const { mealType, date } = getMealParams();
    if (!mealType || !date) {
      showToast("error", "Brak parametrów", "Wróć do dziennika i spróbuj ponownie");
      return;
    }
    const { error } = await apiClient.POST("/diary", {
      body: {
        date,
        userRecipeId: recipe.id,
        quantity: calcUserTotalGrams(recipe) * portion,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      showToast("success", "Dodano!", recipe.name);
    }
  };

  const addGlobalRecipeToDiary = async (recipe: Recipe, portion: number) => {
    const { mealType, date } = getMealParams();
    if (!mealType || !date) {
      showToast("error", "Brak parametrów", "Wróć do dziennika i spróbuj ponownie");
      return;
    }
    const { error } = await apiClient.POST("/diary", {
      body: {
        date,
        recipeId: recipe.id,
        quantity: calcGlobalTotalGrams(recipe) * portion,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      showToast("success", "Dodano!", recipe.name);
    }
  };

  const handleCopy = async (recipeId: string) => {
    const { error, data } = await apiClient.POST("/user-recipes/copy", {
      body: { sourceRecipeId: recipeId },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się skopiować przepisu");
    } else if (data?.userRecipe) {
      setUserRecipes((prev) => [
        ...prev,
        data.userRecipe as unknown as UserRecipe,
      ]);
      setCopiedIds((prev) => new Set([...prev, recipeId]));
      showToast("success", "Skopiowano!", "Dodano do Twoich przepisów");
    }
  };

  const handleDelete = async (recipeId: string) => {
    const { error } = await apiClient.DELETE("/user-recipes/{id}", {
      params: { path: { id: recipeId } },
    });
    if (error) {
      showToast("error", "Błąd", "Nie udało się usunąć przepisu");
    } else {
      setUserRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      showToast("success", "Usunięto", "Przepis został usunięty");
    }
  };

  const handleFavoriteToggle = (recipeId: string, nowFavorite: boolean) => {
    if (!nowFavorite) {
      setFavorites((prev) => prev.filter((f) => f.recipeId !== recipeId));
    } else {
      const recipe = globalRecipes.find((r) => r.id === recipeId);
      if (recipe) {
        setFavorites((prev) => [
          ...prev,
          { id: `temp-${recipeId}`, recipeId, recipe },
        ]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const favoriteIds = new Set(favorites.map((f) => f.recipeId));
  const alreadyCopiedIds = new Set([
    ...copiedIds,
    ...userRecipes
      .filter((ur) => ur.sourceRecipeId !== null)
      .map((ur) => ur.sourceRecipeId as string),
  ]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── MOJE PRZEPISY ── */}
      <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase">
            Moje przepisy
          </h2>
          <Link
            href="/dashboard/recipe-builder"
            className="flex items-center gap-1 text-xs text-[#4ADE80] hover:text-white transition-colors font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nowy przepis
          </Link>
        </div>

        {userRecipes.length === 0 ? (
          <p className="text-[#8FA0B8] text-sm text-center py-4">
            Nie masz jeszcze swoich przepisów.
            <br />
            <span className="text-[#4A5A4A]">
              Stwórz nowy lub skopiuj globalny.
            </span>
          </p>
        ) : (
          userRecipes.map((recipe) => (
            <UserRecipeCard
              key={recipe.id}
              recipe={recipe}
              onAddToDiary={addUserRecipeToDiary}
              onDelete={handleDelete}
            />
          ))
        )}
      </section>

      {/* ── PRZEPISY GLOBALNE ── */}
      {globalRecipes.length > 0 && (
        <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
          <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase mb-3">
            Przepisy globalne
          </h2>
          {globalRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favoriteIds.has(recipe.id)}
              onAddToDiary={addGlobalRecipeToDiary}
              onFavoriteToggle={handleFavoriteToggle}
              onCopy={handleCopy}
              isCopied={alreadyCopiedIds.has(recipe.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd "frontend" && npx tsc --noEmit 2>&1 | grep "RecipeSearch"
```

Oczekiwany wynik: brak błędów TypeScript.

- [ ] **Step 3: Uruchom frontend i przetestuj manualnie**

```bash
cd "frontend" && npm run dev
```

Wejdź na `http://localhost:3000/dashboard/add?tab=recipes&mealType=BREAKFAST&date=2026-04-22`.

Sprawdź:
- Sekcja "MOJE PRZEPISY" widoczna z przyciskiem "+ Nowy przepis"
- Jeśli brak userRecipes: komunikat "Nie masz jeszcze swoich przepisów."
- Sekcja "PRZEPISY GLOBALNE" widoczna jeśli są globalne przepisy
- Klik "Kopiuj" na globalnym przepisie → toast "Skopiowano!", przepis pojawia się w sekcji górnej, przycisk staje się "Skopiowany"
- Klik "Dodaj" na UserRecipeCard → toast "Dodano!"
- Klik "Usuń przepis" → inline potwierdzenie → "Tak" → toast "Usunięto"

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/_components/add/RecipeSearch.tsx"
git commit -m "feat: refactor RecipeSearch into user + global sections"
```

---

## Task 5: recipe-builder — role-aware + tryb edycji

**Files:**
- Modify: `frontend/app/dashboard/recipe-builder/page.tsx`

- [ ] **Step 1: Zastąp całą zawartość `recipe-builder/page.tsx`**

```tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { Search } from "@/app/_components/search/Search";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
};

type Ingredient = {
  productId: string;
  name: string;
  quantity: number;
  imageUrl: string;
};

function RecipeBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await apiClient.GET("/users/me");
      if (!data?.user) return;
      const userRole = data.user.role as "USER" | "ADMIN";
      setRole(userRole);

      if (!editId) return;

      if (userRole === "ADMIN") {
        const res = await apiClient.GET("/recipes/{id}", {
          params: { path: { id: editId } },
        });
        if (res.data?.recipe) {
          setName(res.data.recipe.name);
          setIngredients(
            res.data.recipe.products.map((ing) => ({
              productId: ing.productId,
              name: ing.product.name,
              quantity: parseFloat(ing.quantity),
              imageUrl: ing.product.imageUrl,
            })),
          );
        }
      } else {
        const res = await apiClient.GET("/user-recipes");
        if (res.data?.userRecipes) {
          const found = res.data.userRecipes.find((r) => r.id === editId);
          if (found) {
            setName(found.name);
            setIngredients(
              found.userRecipeIngredients.map((ing) => ({
                productId: ing.product.id,
                name: ing.product.name,
                quantity: parseFloat(ing.quantity),
                imageUrl: ing.product.imageUrl,
              })),
            );
          }
        }
      }
    };
    init();
  }, [editId]);

  const handleAddIngredient = (product: Product) => {
    if (ingredients.some((i) => i.productId === product.id)) return;
    setIngredients([
      ...ingredients,
      {
        productId: product.id,
        name: product.name,
        quantity: 100,
        imageUrl: product.imageUrl ?? "",
      },
    ]);
  };

  const handleRemoveIngredient = (productId: string) => {
    setIngredients(ingredients.filter((i) => i.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setIngredients(
      ingredients.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      ),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Nazwa przepisu nie może być pusta");
      return;
    }
    if (ingredients.length === 0) {
      setError("Brak składników");
      return;
    }

    setSaving(true);
    setError("");

    const products = ingredients.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    let saveError: unknown = null;

    if (role === "ADMIN") {
      if (editId) {
        const { error } = await apiClient.PATCH("/recipes/{id}", {
          params: { path: { id: editId } },
          body: { name, products },
        });
        saveError = error;
      } else {
        const { error } = await apiClient.POST("/recipes", {
          body: { name, products },
        });
        saveError = error;
      }
    } else {
      if (editId) {
        const { error } = await apiClient.PATCH("/user-recipes/{id}", {
          params: { path: { id: editId } },
          body: { name, products },
        });
        saveError = error;
      } else {
        const { error } = await apiClient.POST("/user-recipes", {
          body: { name, products },
        });
        saveError = error;
      }
    }

    setSaving(false);

    if (saveError) {
      setError("Nie udało się zapisać przepisu");
    } else {
      router.push("/dashboard/add?tab=recipes");
    }
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setError("Nazwa przepisu nie może być pusta");
    } else {
      setError("");
    }
    setName(e.target.value);
  };

  const pageTitle = editId
    ? "Edytuj przepis"
    : role === "ADMIN"
    ? "Nowy przepis globalny"
    : "Nowy przepis";

  return (
    <div className="flex flex-col gap-4 p-6 w-full">
      <h2 className="text-2xl font-bold text-white">{pageTitle}</h2>

      {/* Nazwa przepisu */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Nazwa przepisu
          </h3>
        </div>
        <div className="px-4 py-3">
          <input
            type="text"
            placeholder="np. Owsianka z owocami..."
            value={name}
            onChange={onChangeName}
            className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none"
          />
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </div>

      {/* Wyszukiwarka składników */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Dodaj składniki
          </h3>
        </div>
        <div className="px-4 py-3">
          <Search onProductSelect={handleAddIngredient} />
        </div>
      </div>

      {/* Lista składników */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Składniki ({ingredients.length})
          </h3>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {ingredients.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/20">
              Brak składników — wyszukaj i dodaj produkty powyżej.
            </p>
          ) : (
            ingredients.map((ingredient) => (
              <div
                key={ingredient.productId}
                className="flex items-center gap-4 px-4 py-3"
              >
                {ingredient.imageUrl ? (
                  <Image
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    width={32}
                    height={32}
                    className="rounded-lg shrink-0 w-10 h-10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                )}
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {ingredient.name}
                    </span>
                    <button
                      onClick={() =>
                        handleRemoveIngredient(ingredient.productId)
                      }
                      className="text-white/20 hover:text-red-400 transition-colors text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          ingredient.productId,
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-16 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span>g</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors px-5 py-2 rounded-lg text-white font-medium w-fit"
      >
        {saving ? "Zapisuję..." : editId ? "Zapisz zmiany" : "Zapisz przepis"}
      </button>
    </div>
  );
}

export default function RecipeBuilder() {
  return (
    <Suspense>
      <RecipeBuilderContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd "frontend" && npx tsc --noEmit 2>&1 | grep "recipe-builder"
```

Oczekiwany wynik: brak błędów TypeScript.

- [ ] **Step 3: Przetestuj manualnie — tryb tworzenia (USER)**

Zaloguj się jako zwykły user. Wejdź na `/dashboard/recipe-builder`.

Sprawdź:
- Tytuł: "Nowy przepis"
- Zapisz przepis → wywołuje `POST /user-recipes` → po sukcesie przekierowuje na `/dashboard/add?tab=recipes`

- [ ] **Step 4: Przetestuj manualnie — tryb edycji (USER)**

Na stronie `/dashboard/add?tab=recipes` kliknij "Edytuj" na jednym ze swoich przepisów.

Sprawdź:
- URL: `/dashboard/recipe-builder?id=<uuid>`
- Tytuł: "Edytuj przepis"
- Formularz wypełniony danymi istniejącego przepisu (nazwa + składniki)
- Zapis → `PATCH /user-recipes/:id` → przekierowuje na `/dashboard/add?tab=recipes`

- [ ] **Step 5: Przetestuj manualnie — tryb tworzenia (ADMIN)**

Zaloguj się jako admin. Wejdź na `/dashboard/recipe-builder`.

Sprawdź:
- Tytuł: "Nowy przepis globalny"
- Zapisz → wywołuje `POST /recipes`

- [ ] **Step 6: Commit**

```bash
git add "frontend/app/dashboard/recipe-builder/page.tsx"
git commit -m "feat: make recipe-builder role-aware with edit mode"
```
