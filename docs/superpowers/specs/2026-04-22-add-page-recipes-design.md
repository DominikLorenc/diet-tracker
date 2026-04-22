# Design: Zakładka Przepisy — UserRecipe + GlobalRecipe

**Data:** 2026-04-22  
**Zakres:** `RecipeSearch.tsx`, `UserRecipeCard.tsx`, `RecipeCard.tsx`, `recipe-builder/page.tsx`, backend diary

---

## Kontekst

Backend wprowadził dwa typy przepisów:
- `Recipe` — globalny, tworzony i zarządzany tylko przez admina (`POST/PATCH/DELETE /recipes`)
- `UserRecipe` — przepis użytkownika, tworzony przez usera (`POST/PATCH/DELETE /user-recipes`), może być kopią globalnego (`sourceRecipeId`) lub stworzony od zera

Obecny `RecipeSearch.tsx` pobiera tylko globalne przepisy i nie wie o `UserRecipe`. Zakładka "Przepisy" na stronie `/dashboard/add` wymaga przeprojektowania.

---

## Architektura

### Warstwy zmian

**Backend — 1 zmiana + migracja:**
- Dodać `userRecipeId String?` do modelu `DiaryEntryItem` w `schema.prisma`
- Zaktualizować `addDiaryService` i `AddDiaryEntryInput` żeby przyjmowały opcjonalne `userRecipeId`
- Migracja Prisma

**Frontend — komponenty:**

| Plik | Zmiana |
|------|--------|
| `RecipeSearch.tsx` | Duży refaktor: 2 fetche, 2 sekcje |
| `RecipeCard.tsx` | Nowy opcjonalny prop `onCopy` |
| `UserRecipeCard.tsx` | Nowy komponent |
| `recipe-builder/page.tsx` | Role-aware: admin → `/recipes`, user → `/user-recipes` |

**Bez zmian:**
- `add/page.tsx` — tab bar zostaje, tylko `<RecipeSearch />` dostaje nowe props jeśli potrzebne
- Reszta zakładek (Produkty, Nowy produkt)

---

## Sekcja 1 — Warstwa danych

### Nowe typy

```typescript
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

type UserRecipe = {
  id: string;
  name: string;
  createdAt: string;
  sourceRecipeId: string | null;
  userRecipeIngredients: UserRecipeIngredient[];
};
```

Uwaga: `UserRecipe` używa `userRecipeIngredients` (nie `products` jak globalny `Recipe`).

### API calls w `RecipeSearch`

```
GET /recipes              → globalRecipes
GET /user-recipes         → userRecipes
GET /favorites/recipes    → favorites (tylko dla globalnych)
```

### Nowe akcje

```
POST /user-recipes/copy   body: { sourceRecipeId }   → UserRecipe (pełny obiekt)
DELETE /user-recipes/:id                              → usuwa UserRecipe
POST /diary               body: { userRecipeId, quantity, mealType, date }
```

Po `POST /user-recipes/copy` — odpowiedź serwera zawiera pełny `UserRecipe`, dodajemy go bezpośrednio do stanu `userRecipes` bez re-fetchu.

---

## Sekcja 2 — Komponenty

### RecipeSearch.tsx (refaktor)

Dwie sekcje w jednym widoku:

```
┌─ MOJE PRZEPISY ──────────────────────── [+ Nowy przepis] ─┐
│  UserRecipeCard × N                                        │
│  pusta: "Nie masz jeszcze swoich przepisów.                │
│          Stwórz nowy lub skopiuj globalny."                │
└────────────────────────────────────────────────────────────┘

┌─ PRZEPISY GLOBALNE ───────────────────────────────────────┐
│  RecipeCard × N  (z przyciskiem "Kopiuj do moich")        │
│  pusta: "Brak przepisów globalnych"                        │
└────────────────────────────────────────────────────────────┘
```

Stan komponentu:
```typescript
const [globalRecipes, setGlobalRecipes] = useState<Recipe[]>([]);
const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
const [favorites, setFavorites] = useState<RecipeFavorite[]>([]);
const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
```

`copiedIds` — zbiór `sourceRecipeId` skopiowanych przepisów. Używany do wyłączenia przycisku "Kopiuj" na globalnej karcie gdy już skopiowana.

### RecipeCard.tsx (minimalna zmiana)

Nowy opcjonalny prop:
```typescript
onCopy?: (recipeId: string) => Promise<void>;
```

Gdy `onCopy` przekazany — w nagłówku karty pojawia się przycisk "Kopiuj do moich" zamiast serduszka. Gdy `onCopy` nie przekazany — zachowuje dotychczasowe zachowanie (ulubione). Brak breaking changes.

### UserRecipeCard.tsx (nowy komponent)

Props:
```typescript
type Props = {
  recipe: UserRecipe;
  onAddToDiary: (recipe: UserRecipe, portion: number) => Promise<void>;
  onDelete: (recipeId: string) => Promise<void>;
};
```

Nagłówek karty:
- Ikona przepisu
- Nazwa + liczba składników + kcal
- Badge "skopiowany" gdy `sourceRecipeId !== null`
- Link "Edytuj" → `/dashboard/recipe-builder?id=<id>`
- Chevron rozwijający

Po rozwinięciu:
- Lista składników (z `userRecipeIngredients`)
- Suwak porcji
- Przycisk "Dodaj do dziennika" (zielony)
- Inline potwierdzenie usunięcia: "Na pewno usunąć? [Tak] [Nie]" — bez modala

---

## Sekcja 3 — Przepływy UX

### Flow: Kopiuj do moich

1. Klik "Kopiuj do moich" → przycisk disabled + spinner
2. `POST /user-recipes/copy { sourceRecipeId: recipe.id }`
3. Sukces → dodaj wynik do `userRecipes`, dodaj `recipe.id` do `copiedIds`
4. Toast: "Skopiowano do Twoich przepisów"
5. Przycisk zmienia się na "Skopiowany" (disabled, szary) — blokuje duplikaty

### Flow: Usuń mój przepis

1. Klik przycisku usuń → inline potwierdzenie wewnątrz karty
2. Klik "Tak" → `DELETE /user-recipes/:id`
3. Sukces → `setUserRecipes(prev => prev.filter(r => r.id !== id))`
4. Toast: "Przepis usunięty"

### Flow: Dodaj do dziennika (UserRecipe)

1. Rozwiń kartę → ustaw porcje → klik "Dodaj"
2. `POST /diary { userRecipeId, quantity: totalGrams * portion, mealType, date }`
3. Sukces → toast "Dodano!"

### Flow: Nowy przepis

- Przycisk "＋ Nowy przepis" w nagłówku sekcji "MOJE PRZEPISY"
- Nawigacja → `/dashboard/recipe-builder`

### Flow: Edytuj mój przepis

- Klik "Edytuj" na `UserRecipeCard` → `/dashboard/recipe-builder?id=<userRecipeId>`
- Recipe-builder wczytuje `GET /user-recipes`, filtruje po `id`, wypełnia formularz
- Zapis → `PATCH /user-recipes/:id`

---

## Sekcja 4 — Recipe Builder (role-aware)

Strona `/dashboard/recipe-builder/page.tsx` musi wykrywać rolę usera:

```
rola ADMIN → POST /recipes         (tworzenie globalnego)
             PATCH /recipes/:id    (edycja globalnego, gdy ?id= w URL)
             
rola USER  → POST /user-recipes    (tworzenie własnego)
             PATCH /user-recipes/:id (edycja własnego, gdy ?id= w URL)
```

Tryb edycji (gdy `?id=` w URL):
- Pobierz dane na podstawie roli (admin: `GET /recipes/:id`, user: `GET /user-recipes` + filter)
- Wypełnij pola `name` i `ingredients`
- Zapis → odpowiedni PATCH

---

## Stany puste

| Sytuacja | Komunikat |
|----------|-----------|
| Brak UserRecipes | "Nie masz jeszcze swoich przepisów. Stwórz nowy lub skopiuj globalny." |
| Brak globalnych | "Brak przepisów globalnych" (admin musi dodać) |
| Oba puste | Pokazuj sekcję "MOJE PRZEPISY" z zachętą, ukryj "PRZEPISY GLOBALNE" |

---

## Kolejność implementacji

```
1. Backend: migracja DiaryEntryItem + updateAddDiaryService
2. UserRecipeCard.tsx — nowy komponent
3. RecipeSearch.tsx — refaktor (2 sekcje)
4. RecipeCard.tsx — dodanie prop onCopy
5. recipe-builder/page.tsx — role-aware + tryb edycji
```

Kroki 2-4 są niezależne od siebie i mogą iść równolegle. Krok 1 blokuje tylko krok 3 (dodawanie UserRecipe do dziennika).
