# Eaten Toggle & Shopping List — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dodać przycisk "zjedzone" do pozycji dziennika (persisted w DB) oraz stronę listy zakupów generowaną z dziennika dla wybranego zakresu dat, z eksportem do PDF.

**Architecture:** Migracja `isEaten` jest już zrobiona. Backend dostaje jeden nowy endpoint PATCH. Frontend regeneruje `schema.d.ts` z działającego backendu, dzięki czemu `apiClient` jest w pełni typowany. Lista zakupów agreguje składniki po stronie frontendu — bez nowego endpointu.

**Tech Stack:** Express + Prisma + Zod + Vitest/Supertest (backend), Next.js 16 + openapi-fetch + jsPDF (frontend)

---

## Mapa plików

**Backend — modyfikacje:**
- `backend/src/schemas/diarySchema.ts` — dodać `toggleEatenSchema`
- `backend/src/services/diaryService.ts` — dodać `toggleEatenService`
- `backend/src/controllers/diaryController.ts` — dodać `toggleEatenItem`
- `backend/src/routes/diaryRouter.ts` — dodać `PATCH /item/:id/eaten`
- `backend/src/__tests__/diary.test.ts` — dodać testy dla nowego endpointu

**Frontend — modyfikacje:**
- `frontend/src/lib/api/schema.d.ts` — **regenerować** po uruchomieniu backendu
- `frontend/app/_components/dashboard/DiaryDayView.tsx` — dodać `isEaten` do typu + przycisk toggle
- `frontend/app/dashboard/layout.tsx` — dodać "Lista zakupów" do `NAV_ITEMS`

**Frontend — nowe pliki:**
- `frontend/utils/aggregateIngredients.ts` — logika agregacji składników z wielu dni
- `frontend/app/dashboard/shopping-list/page.tsx` — strona listy zakupów

---

## Task 1: Backend — schema + service + controller + route

**Files:**
- Modify: `backend/src/schemas/diarySchema.ts`
- Modify: `backend/src/services/diaryService.ts`
- Modify: `backend/src/controllers/diaryController.ts`
- Modify: `backend/src/routes/diaryRouter.ts`

- [ ] **Krok 1: Dodaj `toggleEatenSchema` do diarySchema.ts**

```typescript
// backend/src/schemas/diarySchema.ts — dodaj na końcu pliku

export const toggleEatenSchema = z.object({
    isEaten: z.boolean(),
});
```

- [ ] **Krok 2: Dodaj `toggleEatenService` do diaryService.ts**

Dodaj na końcu pliku (przed ostatnią klamrą jeśli jest):

```typescript
// backend/src/services/diaryService.ts — dodaj na końcu

export const toggleEatenService = async (
    id: string,
    isEaten: boolean,
    userId: string,
): Promise<DiaryEntryItem> => {
    const diaryItem = await findDiaryItemById(id);
    if (!diaryItem) {
        throw new AppError('Diary item not found', 404);
    }

    const entry = await prisma.diaryEntry.findFirst({
        where: { id: diaryItem.diaryEntryId, userId },
    });
    if (!entry) {
        throw new AppError('Forbidden', 403);
    }

    return prisma.diaryEntryItem.update({
        where: { id },
        data: { isEaten },
    });
};
```

- [ ] **Krok 3: Dodaj `toggleEatenItem` do diaryController.ts**

Dodaj na końcu pliku:

```typescript
// backend/src/controllers/diaryController.ts — dodaj na końcu
// (dodaj też import toggleEatenSchema i toggleEatenService na górze)

import { toggleEatenSchema } from '../schemas/diarySchema';
import { toggleEatenService } from '../services/diaryService';

export const toggleEatenItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const idResult = diaryIdSchema.safeParse(id);
        if (!idResult.success) {
            res.status(400).json({ message: idResult.error.issues });
            return;
        }

        const bodyResult = toggleEatenSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({ message: bodyResult.error.issues });
            return;
        }

        const item = await toggleEatenService(idResult.data, bodyResult.data.isEaten, userId);
        res.status(200).json({ message: 'Item updated', item });
    } catch (error) {
        next(error);
    }
};
```

> **Uwaga:** Importy `toggleEatenSchema` i `toggleEatenService` dopisz do istniejących importów na górze pliku, nie twórz nowych linii `import`.

- [ ] **Krok 4: Dodaj route do diaryRouter.ts**

```typescript
// backend/src/routes/diaryRouter.ts — dodaj import i route

import { createDiaryEntry, getDiary, deleteDiaryEntry, deleteDiaryItem, toggleEatenItem } from '../controllers/diaryController';

// ... istniejące router.xxx ... dodaj:
router.patch('/item/:id/eaten', toggleEatenItem);
```

- [ ] **Krok 5: Sprawdź TypeScript**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /backend"
npx tsc --noEmit
```

Oczekiwany wynik: brak błędów.

- [ ] **Krok 6: Commit**

```bash
git add backend/src/schemas/diarySchema.ts backend/src/services/diaryService.ts backend/src/controllers/diaryController.ts backend/src/routes/diaryRouter.ts
git commit -m "feat: add PATCH /diary/item/:id/eaten endpoint"
```

---

## Task 2: Backend — testy dla nowego endpointu

**Files:**
- Modify: `backend/src/__tests__/diary.test.ts`

- [ ] **Krok 1: Dodaj import `toggleEatenService` do mocków w diary.test.ts**

Na początku pliku `diary.test.ts` znajdź linię:

```typescript
import { addDiaryService, getDiaryServiceByDate, deleteDiaryService } from '../services/diaryService';
```

Zamień na:

```typescript
import { addDiaryService, getDiaryServiceByDate, deleteDiaryService, toggleEatenService } from '../services/diaryService';
```

- [ ] **Krok 2: Dodaj testy dla PATCH /diary/item/:id/eaten**

Dodaj na końcu pliku (przed ostatnią klamrą `}`):

```typescript
describe('PATCH /api/v1/diary/item/:id/eaten', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return 200 and updated item when isEaten is true', async () => {
        vi.mocked(toggleEatenService).mockResolvedValue({
            id: diaryId,
            diaryEntryId: diaryId,
            productId,
            recipeId: null,
            userRecipeId: null,
            mealType: 'BREAKFAST',
            quantity: 100 as any,
            isEaten: true,
            createdAt: new Date(),
        } as any);

        const res = await request(app)
            .patch(`/api/v1/diary/item/${diaryId}/eaten`)
            .send({ isEaten: true })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(200);
        expect(res.body.item.isEaten).toBe(true);
    });

    it('should return 400 when isEaten is not a boolean', async () => {
        const res = await request(app)
            .patch(`/api/v1/diary/item/${diaryId}/eaten`)
            .send({ isEaten: 'tak' })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
        const res = await request(app)
            .patch(`/api/v1/diary/item/${diaryId}/eaten`)
            .send({ isEaten: true });

        expect(res.status).toBe(401);
    });

    it('should return 400 when id is not a valid UUID', async () => {
        const res = await request(app)
            .patch('/api/v1/diary/item/not-a-uuid/eaten')
            .send({ isEaten: true })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
    });
});
```

- [ ] **Krok 3: Uruchom testy**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /backend"
npm test
```

Oczekiwany wynik: wszystkie testy przechodzą, włącznie z 4 nowymi.

- [ ] **Krok 4: Commit**

```bash
git add backend/src/__tests__/diary.test.ts
git commit -m "test: add tests for PATCH /diary/item/:id/eaten"
```

---

## Task 3: Frontend — regeneracja schema.d.ts

**Files:**
- Modify: `frontend/src/lib/api/schema.d.ts` (auto-generowany)

> **Kontekst:** `apiClient` jest typowany z `schema.d.ts`, który generuje się z dokumentacji Swagger backendu. Po dodaniu nowego endpointu trzeba regenerować ten plik.

- [ ] **Krok 1: Uruchom backend**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /backend"
npm run dev
```

Zostaw działający w tle.

- [ ] **Krok 2: Zregeneruj schema.d.ts**

W osobnym terminalu:

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /frontend"
npm run generate:api
```

Oczekiwany wynik: `schema.d.ts` zaktualizowany, w pliku pojawi się `/diary/item/{id}/eaten` z metodą `patch`.

- [ ] **Krok 3: Sprawdź TypeScript**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /frontend"
npx tsc --noEmit
```

- [ ] **Krok 4: Commit**

```bash
git add frontend/src/lib/api/schema.d.ts
git commit -m "chore: regenerate api schema with eaten endpoint"
```

---

## Task 4: Frontend — toggle "zjedzone" w DiaryDayView

**Files:**
- Modify: `frontend/app/_components/dashboard/DiaryDayView.tsx`

- [ ] **Krok 1: Dodaj `isEaten` do interfejsu `DiaryItem`**

Znajdź w pliku:

```typescript
export interface DiaryItem {
  id: string;
  diaryEntryId: string;
  productId: string | null;
  recipeId: string | null;
  userRecipeId: string | null;
  mealType: MealType;
  createdAt: string;
  quantity: string;
  product: Product | null;
  recipe: Recipe | null;
  userRecipe: UserRecipe | null;
}
```

Zamień na:

```typescript
export interface DiaryItem {
  id: string;
  diaryEntryId: string;
  productId: string | null;
  recipeId: string | null;
  userRecipeId: string | null;
  mealType: MealType;
  createdAt: string;
  quantity: string;
  isEaten: boolean;
  product: Product | null;
  recipe: Recipe | null;
  userRecipe: UserRecipe | null;
}
```

- [ ] **Krok 2: Dodaj handler `handleToggleEaten`**

W komponencie `DiaryDayView`, tuż po `handleDeleteItem`, dodaj:

```typescript
const handleToggleEaten = async (id: string, currentIsEaten: boolean) => {
  const { error } = await apiClient.PATCH('/diary/item/{id}/eaten', {
    params: { path: { id } },
    body: { isEaten: !currentIsEaten },
  });
  if (error) {
    showToast('error', 'Nie udało się zaktualizować wpisu', '');
    return;
  }
  setEntries(
    entries.map((entry) => ({
      ...entry,
      items: entry.items.map((item) =>
        item.id === id ? { ...item, isEaten: !currentIsEaten } : item,
      ),
    })),
  );
};
```

- [ ] **Krok 3: Dodaj przycisk toggle w renderowaniu każdego item**

W sekcji renderowania pozycji (gdzie jest `key={item.id}`), znajdź przycisk usuwania `✕` i dodaj obok niego przycisk toggle. Zmień fragment:

```typescript
<button
  onClick={() => handleDeleteItem(item.id)}
  className="text-xs opacity-40 hover:opacity-80 transition-opacity ml-1"
  style={{ color: "#F18FA3" }}
>
  ✕
</button>
```

Na:

```typescript
<button
  onClick={() => handleToggleEaten(item.id, item.isEaten)}
  className="text-lg leading-none transition-opacity hover:opacity-70 ml-1"
  title={item.isEaten ? 'Oznacz jako niezjedzone' : 'Oznacz jako zjedzone'}
>
  {item.isEaten ? '✅' : '⬜'}
</button>
<button
  onClick={() => handleDeleteItem(item.id)}
  className="text-xs opacity-40 hover:opacity-80 transition-opacity ml-1"
  style={{ color: "#F18FA3" }}
>
  ✕
</button>
```

- [ ] **Krok 4: Wygaszone style dla zjedzonych pozycji**

W elemencie `<div key={item.id} className="flex items-center gap-3 px-4 h-[50px]"`, dodaj style dla pozycji zjedzonych:

```typescript
<div
  key={item.id}
  className="flex items-center gap-3 px-4 h-[50px] transition-opacity"
  style={{
    background: "#1A2B1F",
    borderTop: idx > 0 ? "1px solid #1E3322" : undefined,
    opacity: item.isEaten ? 0.5 : 1,
  }}
>
```

- [ ] **Krok 5: Sprawdź TypeScript**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /frontend"
npx tsc --noEmit
```

- [ ] **Krok 6: Commit**

```bash
git add frontend/app/_components/dashboard/DiaryDayView.tsx
git commit -m "feat: add eaten toggle to diary items"
```

---

## Task 5: Frontend — funkcja agregacji składników

**Files:**
- Create: `frontend/utils/aggregateIngredients.ts`

> **Kontekst:** Funkcja bierze tablicę `DiaryEntry[]` (z wielu dni) i zwraca płaską listę produktów z sumowanymi gramaturami. Dla przepisów/UserRecipe — rozszerza składniki i skaluje proporcjonalnie do porcji.

- [ ] **Krok 1: Stwórz plik `aggregateIngredients.ts`**

```typescript
// frontend/utils/aggregateIngredients.ts

import type { DiaryEntry, DiaryItem } from '@/app/_components/dashboard/DiaryDayView';

export interface AggregatedIngredient {
  productId: string;
  productName: string;
  totalGrams: number;
}

export function aggregateIngredients(entries: DiaryEntry[]): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();

  const add = (productId: string, productName: string, grams: number) => {
    const existing = map.get(productId);
    if (existing) {
      existing.totalGrams += grams;
    } else {
      map.set(productId, { productId, productName, totalGrams: grams });
    }
  };

  for (const entry of entries) {
    for (const item of entry.items) {
      const qty = parseFloat(item.quantity);

      if (item.product) {
        add(item.product.id, item.product.name, qty);
      } else if (item.recipe) {
        const totalRecipeGrams = item.recipe.products.reduce(
          (sum, rp) => sum + parseFloat(rp.quantity),
          0,
        );
        const multiplier = totalRecipeGrams > 0 ? qty / totalRecipeGrams : 0;
        for (const rp of item.recipe.products) {
          add(rp.product.id, rp.product.name, parseFloat(rp.quantity) * multiplier);
        }
      } else if (item.userRecipe) {
        const totalRecipeGrams = item.userRecipe.userRecipeIngredients.reduce(
          (sum, ri) => sum + parseFloat(ri.quantity),
          0,
        );
        const multiplier = totalRecipeGrams > 0 ? qty / totalRecipeGrams : 0;
        for (const ri of item.userRecipe.userRecipeIngredients) {
          add(ri.product.id, ri.product.name, parseFloat(ri.quantity) * multiplier);
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName, 'pl'),
  );
}
```

- [ ] **Krok 2: Sprawdź TypeScript**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /frontend"
npx tsc --noEmit
```

- [ ] **Krok 3: Commit**

```bash
git add frontend/utils/aggregateIngredients.ts
git commit -m "feat: add ingredient aggregation utility"
```

---

## Task 6: Frontend — strona lista zakupów

**Files:**
- Create: `frontend/app/dashboard/shopping-list/page.tsx`

> **Kontekst:** Strona fetchuje `DiaryEntry[]` równolegle dla każdego dnia z wybranego zakresu, agreguje składniki, wyświetla interaktywną listę z możliwością usuwania i eksportu do PDF.

- [ ] **Krok 1: Zainstaluj jsPDF**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /frontend"
npm install jspdf
npm install --save-dev @types/jspdf
```

> Jeśli `@types/jspdf` nie istnieje (jsPDF ma własne typy), pomiń drugą komendę — `jspdf` ma wbudowane definicje TypeScript.

- [ ] **Krok 2: Stwórz stronę `shopping-list/page.tsx`**

```typescript
// frontend/app/dashboard/shopping-list/page.tsx
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { apiClient } from "@/app/lib/apiClient";
import { aggregateIngredients, AggregatedIngredient } from "@/utils/aggregateIngredients";
import type { DiaryEntry } from "@/app/_components/dashboard/DiaryDayView";

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  const end = new Date(to);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function ShoppingListPage() {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0];

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(nextWeek);
  const [ingredients, setIngredients] = useState<AggregatedIngredient[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const visible = ingredients.filter((i) => !removed.has(i.productId));

  const handleGenerate = async () => {
    setLoading(true);
    setRemoved(new Set());
    setGenerated(false);

    const dates = getDatesInRange(from, to);
    const results = await Promise.all(
      dates.map((date) =>
        apiClient.GET("/diary", { params: { query: { date } } }),
      ),
    );

    const allEntries: DiaryEntry[] = results
      .flatMap((r) => r.data?.diaryEntries ?? []);

    setIngredients(aggregateIngredients(allEntries));
    setLoading(false);
    setGenerated(true);
  };

  const handleRemove = (productId: string) => {
    setRemoved((prev) => new Set([...prev, productId]));
  };

  const handleReset = () => setRemoved(new Set());

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Lista zakupów: ${from} — ${to}`, 14, 20);
    doc.setFontSize(12);
    visible.forEach((item, i) => {
      doc.text(
        `☐  ${item.productName}  ${Math.round(item.totalGrams)} g`,
        14,
        36 + i * 9,
      );
    });
    doc.save(`lista-zakupow-${from}-${to}.pdf`);
  };

  return (
    <div
      className="flex flex-col gap-6 p-5 sm:p-7 min-h-full"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <div className="flex flex-col gap-1">
        <h1
          className="text-[42px] sm:text-[56px] font-bold leading-tight"
          style={{ color: "#F3F7FF", fontFamily: "var(--font-newsreader)" }}
        >
          Lista zakupów
        </h1>
        <p className="text-sm font-medium" style={{ color: "#8FA0B8" }}>
          Wybierz zakres dat i wygeneruj listę składników z dziennika
        </p>
      </div>

      {/* Date picker */}
      <div
        className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl"
        style={{ background: "#162218", border: "1px solid #1E3322" }}
      >
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-bold" style={{ color: "#8FA0B8" }}>
            OD
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "#0F1A10",
              border: "1px solid #1E3322",
              color: "#F3F7FF",
            }}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-bold" style={{ color: "#8FA0B8" }}>
            DO
          </label>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "#0F1A10",
              border: "1px solid #1E3322",
              color: "#F3F7FF",
            }}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: "linear-gradient(180deg, #16A34A 0%, #15803D 100%)",
              color: "#fff",
            }}
          >
            {loading ? "Generuję…" : "Generuj listę"}
          </button>
        </div>
      </div>

      {/* List */}
      {generated && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "#8FA0B8" }}>
              {visible.length} składników
            </p>
            <div className="flex gap-2">
              {removed.size > 0 && (
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    color: "#9FB0C7",
                    background: "#162218",
                    border: "1px solid #1E3322",
                  }}
                >
                  Resetuj ({removed.size})
                </button>
              )}
              <button
                onClick={handleExportPdf}
                disabled={visible.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40"
                style={{
                  color: "#F3F7FF",
                  background: "#162218",
                  border: "1px solid #1E3322",
                }}
              >
                Eksportuj PDF
              </button>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm" style={{ color: "#8FA0B8" }}>
              {ingredients.length === 0
                ? "Brak zaplanowanych posiłków w tym zakresie dat."
                : "Wszystkie składniki usunięte z listy."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between px-4 h-[50px] rounded-xl"
                  style={{ background: "#162218", border: "1px solid #1E3322" }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#D6DFEC" }}
                  >
                    {item.productName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: "#F4C65D",
                        fontFamily: "var(--font-ibm-plex-mono)",
                      }}
                    >
                      {Math.round(item.totalGrams)} g
                    </span>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                      style={{
                        color: "#9FB0C7",
                        background: "#0F1A10",
                        border: "1px solid #1E3322",
                      }}
                    >
                      Mam już
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Krok 3: Sprawdź TypeScript**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /frontend"
npx tsc --noEmit
```

- [ ] **Krok 4: Commit**

```bash
git add frontend/app/dashboard/shopping-list/page.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat: add shopping list page with PDF export"
```

---

## Task 7: Frontend — dodaj link w nawigacji

**Files:**
- Modify: `frontend/app/dashboard/layout.tsx`

- [ ] **Krok 1: Dodaj pozycję do `NAV_ITEMS`**

Znajdź w `layout.tsx`:

```typescript
const NAV_ITEMS = [
  { emoji: "📓", name: "Dziennik", href: "/dashboard" },
  { emoji: "📈", name: "Postępy", href: "/dashboard/progress" },
  { emoji: "🥦", name: "Produkty", href: "/dashboard/products" },
  { emoji: "👤", name: "Profil", href: "/dashboard/profile" },
  { emoji: "📦", name: "Wszystkie produkty", href: "/dashboard/all" },
  { emoji: "🍳", name: "Przepisy", href: "/dashboard/recipes" },
];
```

Zamień na:

```typescript
const NAV_ITEMS = [
  { emoji: "📓", name: "Dziennik", href: "/dashboard" },
  { emoji: "📈", name: "Postępy", href: "/dashboard/progress" },
  { emoji: "🥦", name: "Produkty", href: "/dashboard/products" },
  { emoji: "👤", name: "Profil", href: "/dashboard/profile" },
  { emoji: "📦", name: "Wszystkie produkty", href: "/dashboard/all" },
  { emoji: "🍳", name: "Przepisy", href: "/dashboard/recipes" },
  { emoji: "🛒", name: "Lista zakupów", href: "/dashboard/shopping-list" },
];
```

- [ ] **Krok 2: Sprawdź TypeScript i odpal frontend**

```bash
cd "/Users/dominik/Desktop/Projects/diet-tracker/diet-tracker /frontend"
npx tsc --noEmit
npm run dev
```

Otwórz http://localhost:3000/dashboard i sprawdź czy link "Lista zakupów" pojawia się w sidebarze.

- [ ] **Krok 3: Przetestuj ręcznie**

1. Przejdź do `/dashboard` → dodaj posiłki na dzisiaj i jutro
2. Kliknij `⬜` przy pozycji — powinna zmienić się na `✅`, pozycja wyszarzona
3. Przejdź do `/dashboard/shopping-list`
4. Wybierz zakres dat obejmujący dni z posiłkami → kliknij "Generuj listę"
5. Sprawdź czy składniki się pojawiają z poprawnymi gramaturami
6. Kliknij "Mam już" przy składniku — powinien zniknąć z listy
7. Kliknij "Eksportuj PDF" — plik PDF powinien się pobrać z listą pozostałych składników

- [ ] **Krok 4: Commit**

```bash
git add frontend/app/dashboard/layout.tsx
git commit -m "feat: add shopping list link to dashboard nav"
```

---

## Podsumowanie commitów

Po ukończeniu wszystkich tasków historia powinna wyglądać tak:

```
feat: add shopping list link to dashboard nav
feat: add shopping list page with PDF export
feat: add ingredient aggregation utility
feat: add eaten toggle to diary items
chore: regenerate api schema with eaten endpoint
test: add tests for PATCH /diary/item/:id/eaten
feat: add PATCH /diary/item/:id/eaten endpoint
feat: add isEaten to DiaryEntryItem (migration)  ← już zrobione
```
