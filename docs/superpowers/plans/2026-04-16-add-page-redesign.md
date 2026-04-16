# Add Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Przeprojektować stronę `/dashboard/add` na 3-zakładkową (Produkty / Przepisy / Nowy produkt) z inline expand kart, ulubionych (serduszko) i usunięciem buga z recent searches.

**Architecture:** Backend dostaje dwa nowe modele Prisma (`ProductFavorite`, `RecipeFavorite`) i 6 endpointów pod `/favorites`. Frontend zastępuje monolityczny `Search.tsx` trzema oddzielnymi komponentami zakładek; zakładka aktywna trzymana w URL search param `?tab=`.

**Tech Stack:** Express + Prisma + Zod (backend); Next.js 15 App Router + openapi-fetch + Tailwind (frontend).

---

## File Map

### Backend — tworzone / modyfikowane

| Plik | Akcja | Odpowiedzialność |
|------|-------|-----------------|
| `backend/prisma/schema.prisma` | Modify | Dodaj modele `ProductFavorite`, `RecipeFavorite` + relacje |
| `backend/src/services/favoritesService.ts` | Create | CRUD dla ulubionych produktów i przepisów |
| `backend/src/controllers/favoritesController.ts` | Create | HTTP handlers dla `/favorites/*` |
| `backend/src/routes/favoritesRoutes.ts` | Create | Router z auth + swagger registration |
| `backend/src/routes/index.ts` | Modify | Zarejestruj `/favorites` router |

### Frontend — tworzone / modyfikowane

| Plik | Akcja | Odpowiedzialność |
|------|-------|-----------------|
| `frontend/src/lib/api/schema.d.ts` | Regenerate | Typy openapi zsynchronizowane z nowym backendem |
| `frontend/app/_components/shared/ProductForm.tsx` | Modify | Dodaj opcjonalne `onSuccess(product)` callback; `closeModal` staje się opcjonalne |
| `frontend/app/_components/add/ProductCard.tsx` | Create | Karta produktu z inline expand + toggle serduszka |
| `frontend/app/_components/add/RecipeCard.tsx` | Create | Karta przepisu z inline expand + toggle serduszka |
| `frontend/app/_components/add/ProductSearch.tsx` | Create | Zakładka Produkty (recent + favorites + search + inline add) |
| `frontend/app/_components/add/RecipeSearch.tsx` | Create | Zakładka Przepisy (favorites + lista + inline add) |
| `frontend/app/dashboard/add/page.tsx` | Modify | Strona z 3 zakładkami, tab state w URL |

---

## Task 1: Prisma schema — nowe modele ulubionych

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [x] **Step 1: Dodaj relacje do istniejących modeli i nowe modele**

Otwórz `backend/prisma/schema.prisma`. Do modelu `User` dodaj dwie linie na końcu listy pól:

```prisma
model User {
    id        String   @id @default(uuid())
    email     String   @unique
    username  String
    password  String
    role      Role   @default(USER)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    imageUrl          String @default("")
    diaryEntries DiaryEntry[]
    recentSearches RecentSearch[]
    userGoals UserGoal?
    bodyMeasurements BodyMeasurement[]
    productFavorites ProductFavorite[]
    recipeFavorites  RecipeFavorite[]
  }
```

Do modelu `Product` dodaj jedną linię:

```prisma
model Product {
  id           String        @id @default(uuid())
  name         String        @unique
  calories     Decimal
  carbs        Decimal
  protein      Decimal
  fat          Decimal
  imageUrl     String        @default("")
  createdAt    DateTime      @default(now())
  diaryEntriesItems DiaryEntryItem[]
  recipeIngredient RecipeIngredient[]
  recentSearches RecentSearch[]
  productFavorites ProductFavorite[]
}
```

Do modelu `Recipe` dodaj jedną linię:

```prisma
  model Recipe {
    id           String        @id @default(uuid())
    name         String        @unique
    createdAt    DateTime      @default(now())
    products RecipeIngredient[]
    diaryEntriesItems DiaryEntryItem[]
    recipeFavorites RecipeFavorite[]
  }
```

Na końcu pliku (po `DiaryEntryItem`) dodaj dwa nowe modele:

```prisma
model ProductFavorite {
  id        String   @id @default(uuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([userId, productId])
}

model RecipeFavorite {
  id        String   @id @default(uuid())
  userId    String
  recipeId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  recipe    Recipe   @relation(fields: [recipeId], references: [id])

  @@unique([userId, recipeId])
}
```

- [x] **Step 2: Utwórz migrację**

```bash
cd "backend"
npx prisma migrate dev --name add_favorites
```

Oczekiwany wynik: `✔ Generated Prisma Client` oraz nowy folder w `prisma/migrations/`.

- [x] **Step 3: Wygeneruj Prisma Client**

```bash
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
cd ..
git add "backend/prisma/schema.prisma" "backend/prisma/migrations/"
git commit -m "feat: add ProductFavorite and RecipeFavorite prisma models"
```

---

## Task 2: Favorites Service

**Files:**
- Create: `backend/src/services/favoritesService.ts`

- [x] **Step 1: Utwórz plik serwisu**

Utwórz `backend/src/services/favoritesService.ts`:

```typescript
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

// ─── Product Favorites ──────────────────────────────────────────────────────

export const getFavoriteProductsService = async (userId: string) => {
    return prisma.productFavorite.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
};

export const addFavoriteProductService = async (userId: string, productId: string) => {
    const exists = await prisma.productFavorite.findUnique({
        where: { userId_productId: { userId, productId } },
    });
    if (exists) throw new AppError('Product already in favorites', 409);

    return prisma.productFavorite.create({
        data: { userId, productId },
        include: { product: true },
    });
};

export const removeFavoriteProductService = async (userId: string, productId: string) => {
    const record = await prisma.productFavorite.findUnique({
        where: { userId_productId: { userId, productId } },
    });
    if (!record) throw new AppError('Favorite not found', 404);

    return prisma.productFavorite.delete({
        where: { userId_productId: { userId, productId } },
    });
};

// ─── Recipe Favorites ───────────────────────────────────────────────────────

export const getFavoriteRecipesService = async (userId: string) => {
    return prisma.recipeFavorite.findMany({
        where: { userId },
        include: {
            recipe: {
                include: { products: { include: { product: true } } },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
};

export const addFavoriteRecipeService = async (userId: string, recipeId: string) => {
    const exists = await prisma.recipeFavorite.findUnique({
        where: { userId_recipeId: { userId, recipeId } },
    });
    if (exists) throw new AppError('Recipe already in favorites', 409);

    return prisma.recipeFavorite.create({
        data: { userId, recipeId },
        include: {
            recipe: {
                include: { products: { include: { product: true } } },
            },
        },
    });
};

export const removeFavoriteRecipeService = async (userId: string, recipeId: string) => {
    const record = await prisma.recipeFavorite.findUnique({
        where: { userId_recipeId: { userId, recipeId } },
    });
    if (!record) throw new AppError('Favorite not found', 404);

    return prisma.recipeFavorite.delete({
        where: { userId_recipeId: { userId, recipeId } },
    });
};
```

- [ ] **Step 2: Commit**

```bash
git add "backend/src/services/favoritesService.ts"
git commit -m "feat: add favorites service for products and recipes"
```

---

## Task 3: Favorites Controller

**Files:**
- Create: `backend/src/controllers/favoritesController.ts`

- [ ] **Step 1: Utwórz plik kontrolera**

Utwórz `backend/src/controllers/favoritesController.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
    getFavoriteProductsService,
    addFavoriteProductService,
    removeFavoriteProductService,
    getFavoriteRecipesService,
    addFavoriteRecipeService,
    removeFavoriteRecipeService,
} from '../services/favoritesService';

const productIdSchema = z.uuid();
const recipeIdSchema = z.uuid();

// ─── Products ────────────────────────────────────────────────────────────────

export const getFavoriteProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const favorites = await getFavoriteProductsService(userId);
        res.status(200).json({ favorites });
    } catch (error) {
        next(error);
    }
};

export const addFavoriteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = productIdSchema.safeParse(req.body.productId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid productId' });
            return;
        }
        const userId = req.userId!;
        const favorite = await addFavoriteProductService(userId, result.data);
        res.status(201).json({ message: 'Added to favorites', favorite });
    } catch (error) {
        next(error);
    }
};

export const removeFavoriteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = productIdSchema.safeParse(req.params.productId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid productId' });
            return;
        }
        const userId = req.userId!;
        await removeFavoriteProductService(userId, result.data);
        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        next(error);
    }
};

// ─── Recipes ─────────────────────────────────────────────────────────────────

export const getFavoriteRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const favorites = await getFavoriteRecipesService(userId);
        res.status(200).json({ favorites });
    } catch (error) {
        next(error);
    }
};

export const addFavoriteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = recipeIdSchema.safeParse(req.body.recipeId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid recipeId' });
            return;
        }
        const userId = req.userId!;
        const favorite = await addFavoriteRecipeService(userId, result.data);
        res.status(201).json({ message: 'Added to favorites', favorite });
    } catch (error) {
        next(error);
    }
};

export const removeFavoriteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = recipeIdSchema.safeParse(req.params.recipeId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid recipeId' });
            return;
        }
        const userId = req.userId!;
        await removeFavoriteRecipeService(userId, result.data);
        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        next(error);
    }
};
```

- [ ] **Step 2: Commit**

```bash
git add "backend/src/controllers/favoritesController.ts"
git commit -m "feat: add favorites controller"
```

---

## Task 4: Favorites Routes

**Files:**
- Create: `backend/src/routes/favoritesRoutes.ts`
- Modify: `backend/src/routes/index.ts`

- [ ] **Step 1: Utwórz plik routes z rejestracją swagger**

Utwórz `backend/src/routes/favoritesRoutes.ts`:

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { registry, errorSchema } from '../swagger';
import {
    getFavoriteProducts,
    addFavoriteProduct,
    removeFavoriteProduct,
    getFavoriteRecipes,
    addFavoriteRecipe,
    removeFavoriteRecipe,
} from '../controllers/favoritesController';

const router = Router();
router.use(authMiddleware);

const errorContent = { 'application/json': { schema: errorSchema } };

const productSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: z.string(),
    carbs: z.string(),
    protein: z.string(),
    fat: z.string(),
    imageUrl: z.string(),
    createdAt: z.string(),
});

const productFavoriteSchema = z.object({
    id: z.string(),
    userId: z.string(),
    productId: z.string(),
    createdAt: z.string(),
    product: productSchema,
});

const recipeIngredientSchema = z.object({
    id: z.string(),
    quantity: z.string(),
    productId: z.string(),
    recipeId: z.string(),
    createdAt: z.string(),
    product: productSchema,
});

const recipeSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    products: z.array(recipeIngredientSchema),
});

const recipeFavoriteSchema = z.object({
    id: z.string(),
    userId: z.string(),
    recipeId: z.string(),
    createdAt: z.string(),
    recipe: recipeSchema,
});

// ─── GET /favorites/products ──────────────────────────────────────────────────

registry.registerPath({
    method: 'get',
    path: '/favorites/products',
    tags: ['Favorites'],
    summary: 'Get favorite products',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of favorite products',
            content: {
                'application/json': {
                    schema: z.object({ favorites: z.array(productFavoriteSchema) }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.get('/products', getFavoriteProducts);

// ─── POST /favorites/products ─────────────────────────────────────────────────

registry.registerPath({
    method: 'post',
    path: '/favorites/products',
    tags: ['Favorites'],
    summary: 'Add product to favorites',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: z.object({ productId: z.uuid() }) },
            },
        },
    },
    responses: {
        201: {
            description: 'Product added to favorites',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), favorite: productFavoriteSchema }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        409: { description: 'Already in favorites', content: errorContent },
    },
});
router.post('/products', addFavoriteProduct);

// ─── DELETE /favorites/products/:productId ────────────────────────────────────

registry.registerPath({
    method: 'delete',
    path: '/favorites/products/{productId}',
    tags: ['Favorites'],
    summary: 'Remove product from favorites',
    security: [{ cookieAuth: [] }],
    request: { params: z.object({ productId: z.uuid() }) },
    responses: {
        200: {
            description: 'Removed from favorites',
            content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'Not found', content: errorContent },
    },
});
router.delete('/products/:productId', removeFavoriteProduct);

// ─── GET /favorites/recipes ───────────────────────────────────────────────────

registry.registerPath({
    method: 'get',
    path: '/favorites/recipes',
    tags: ['Favorites'],
    summary: 'Get favorite recipes',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of favorite recipes',
            content: {
                'application/json': {
                    schema: z.object({ favorites: z.array(recipeFavoriteSchema) }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.get('/recipes', getFavoriteRecipes);

// ─── POST /favorites/recipes ──────────────────────────────────────────────────

registry.registerPath({
    method: 'post',
    path: '/favorites/recipes',
    tags: ['Favorites'],
    summary: 'Add recipe to favorites',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: z.object({ recipeId: z.uuid() }) },
            },
        },
    },
    responses: {
        201: {
            description: 'Recipe added to favorites',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), favorite: recipeFavoriteSchema }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        409: { description: 'Already in favorites', content: errorContent },
    },
});
router.post('/recipes', addFavoriteRecipe);

// ─── DELETE /favorites/recipes/:recipeId ──────────────────────────────────────

registry.registerPath({
    method: 'delete',
    path: '/favorites/recipes/{recipeId}',
    tags: ['Favorites'],
    summary: 'Remove recipe from favorites',
    security: [{ cookieAuth: [] }],
    request: { params: z.object({ recipeId: z.uuid() }) },
    responses: {
        200: {
            description: 'Removed from favorites',
            content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'Not found', content: errorContent },
    },
});
router.delete('/recipes/:recipeId', removeFavoriteRecipe);

export default router;
```

- [ ] **Step 2: Zarejestruj router w routes/index.ts**

Otwórz `backend/src/routes/index.ts` i zmodyfikuj go:

```typescript
import { Router } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import diaryRouter from './diaryRouter';
import recipeRoutes from './recipeRoutes';
import recentSearchesRoute from './recentSearchesRoute';
import measurementsRoute from './measurements';
import favoritesRoutes from './favoritesRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/diary', diaryRouter);
router.use('/recipes', recipeRoutes);
router.use('/recent-searches', recentSearchesRoute);
router.use('/measurements', measurementsRoute);
router.use('/favorites', favoritesRoutes);

export default router;
```

- [ ] **Step 3: Uruchom serwer i sprawdź endpointy**

```bash
cd backend
npm run dev
```

W osobnym terminalu sprawdź swagger:
```bash
curl http://localhost:4000/api/v1/docs.json | grep -o '"\/favorites[^"]*"'
```

Oczekiwany wynik: linie `/favorites/products`, `/favorites/products/{productId}`, `/favorites/recipes`, `/favorites/recipes/{recipeId}`.

- [ ] **Step 4: Commit**

```bash
git add "backend/src/routes/favoritesRoutes.ts" "backend/src/routes/index.ts"
git commit -m "feat: add favorites routes (products + recipes)"
```

---

## Task 5: Regeneruj frontend API schema

**Files:**
- Modify: `frontend/src/lib/api/schema.d.ts`

> **Uwaga:** Wymagany działający backend na porcie 4000. Uruchom `npm run dev` w folderze `backend/` przed tym krokiem.

- [ ] **Step 1: Wygeneruj nową schemę**

```bash
cd frontend
npm run generate:api
```

Oczekiwany wynik: plik `frontend/src/lib/api/schema.d.ts` zaktualizowany — powinny pojawić się sekcje `/favorites/products`, `/favorites/products/{productId}`, `/favorites/recipes`, `/favorites/recipes/{recipeId}`.

Sprawdź:
```bash
grep -c "favorites" src/lib/api/schema.d.ts
```

Wynik: liczba > 0.

- [ ] **Step 2: Commit**

```bash
git add "frontend/src/lib/api/schema.d.ts"
git commit -m "chore: regenerate openapi schema with favorites endpoints"
```

---

## Task 6: Adapt ProductForm — opcjonalne onSuccess callback

**Files:**
- Modify: `frontend/app/_components/shared/ProductForm.tsx`

Obecny `ProductForm` wymaga `closeModal` i nie zwraca produktu do rodzica. W zakładce "Nowy produkt" potrzebujemy wiedzieć jaki produkt został stworzony (żeby go otworzyć w inline expand). Dodajemy opcjonalne `onSuccess`.

- [ ] **Step 1: Zmodyfikuj props i wywołanie onSuccess**

W `frontend/app/_components/shared/ProductForm.tsx` zmień sygnaturę komponentu i wewnętrzne wywołania:

```typescript
export const ProductForm = ({
  closeModal = () => {},
  onSuccess,
  productToEdit,
}: {
  closeModal?: () => void;
  onSuccess?: (product: Product) => void;
  productToEdit?: Product | null;
}) => {
```

W funkcji `addProduct`, po `showToast(...)`:

```typescript
      showToast(
        "success",
        "Produkt dodany!",
        `${product.calories} kcal | B: ${product.protein}g W: ${product.carbs}g T: ${product.fat}g`,
      );
      onSuccess?.(product as Product);
      closeModal();
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Oczekiwany wynik: brak błędów.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/_components/shared/ProductForm.tsx"
git commit -m "feat: make closeModal optional and add onSuccess callback to ProductForm"
```

---

## Task 7: ProductCard z inline expand i toggle ulubionych

**Files:**
- Create: `frontend/app/_components/add/ProductCard.tsx`

Nowa karta dla zakładki "Produkty". Kliknięcie karty rozszerza ją in-place (pokazuje pole ilości + przycisk dodaj). Serduszko toggluje ulubione optimistically.

- [ ] **Step 1: Utwórz komponent**

Utwórz `frontend/app/_components/add/ProductCard.tsx`:

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
  createdAt: string;
};

type Props = {
  product: Product;
  isFavorite?: boolean;
  onAddToDiary: (product: Product, quantity: number) => Promise<void>;
  onFavoriteToggle?: (productId: string, nowFavorite: boolean) => void;
  defaultExpanded?: boolean;
};

export const AddProductCard = ({
  product,
  isFavorite = false,
  onAddToDiary,
  onFavoriteToggle,
  defaultExpanded = false,
}: Props) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [quantity, setQuantity] = useState(100);
  const [favorite, setFavorite] = useState(isFavorite);
  const [adding, setAdding] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next); // optimistic
    if (next) {
      const { error } = await apiClient.POST("/favorites/products", {
        body: { productId: product.id },
      });
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się dodać do ulubionych");
      } else {
        onFavoriteToggle?.(product.id, true);
      }
    } else {
      const { error } = await apiClient.DELETE(
        "/favorites/products/{productId}",
        { params: { path: { productId: product.id } } },
      );
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się usunąć z ulubionych");
      } else {
        onFavoriteToggle?.(product.id, false);
      }
    }
  };

  const handleAdd = async () => {
    if (quantity <= 0) return;
    setAdding(true);
    await onAddToDiary(product, quantity);
    setAdding(false);
    setExpanded(false);
  };

  return (
    <div
      className="rounded-xl border border-[#1E3322] overflow-hidden bg-[#162218] mb-2 cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={40}
            height={40}
            className="rounded-lg shrink-0 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#1E2D22] shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[#EAF1FC] font-medium text-sm truncate">
            {product.name}
          </p>
          <p className="text-[#AAB8CD] text-xs mt-0.5">
            B: {product.protein}g · W: {product.carbs}g · T: {product.fat}g
          </p>
        </div>
        <span className="text-[#F4C65D] font-bold font-mono text-sm shrink-0">
          {product.calories} kcal
        </span>
        <button
          onClick={toggleFavorite}
          className="text-lg shrink-0 ml-1"
          aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      {/* Inline expand */}
      {expanded && (
        <div
          className="border-t border-[#1E3322] bg-[#1A2B1F] px-4 py-3 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="text-[#AAB8CD] text-sm shrink-0">Ilość:</label>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 bg-[#0F1A10] border border-[#1E3322] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#22C55E]"
          />
          <span className="text-[#AAB8CD] text-sm">g</span>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="ml-auto bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            {adding ? "Dodaję..." : "Dodaj do dziennika"}
          </button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Oczekiwany wynik: brak błędów.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/_components/add/ProductCard.tsx"
git commit -m "feat: add ProductCard with inline expand and favorite toggle"
```

---

## Task 8: RecipeCard z inline expand i toggle ulubionych

**Files:**
- Create: `frontend/app/_components/add/RecipeCard.tsx`

Analogicznie do `AddProductCard`, ale dla przepisów. Kalorie liczone jako suma składników.

- [ ] **Step 1: Utwórz komponent**

Utwórz `frontend/app/_components/add/RecipeCard.tsx`:

```typescript
"use client";

import { useState } from "react";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

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

type Props = {
  recipe: Recipe;
  isFavorite?: boolean;
  onAddToDiary: (recipe: Recipe, quantity: number) => Promise<void>;
  onFavoriteToggle?: (recipeId: string, nowFavorite: boolean) => void;
  defaultExpanded?: boolean;
};

const calcTotalKcal = (recipe: Recipe): number =>
  recipe.products.reduce((sum, ing) => {
    const qty = parseFloat(ing.quantity);
    const kcal = parseFloat(ing.product.calories);
    return sum + (qty / 100) * kcal;
  }, 0);

export const RecipeCard = ({
  recipe,
  isFavorite = false,
  onAddToDiary,
  onFavoriteToggle,
  defaultExpanded = false,
}: Props) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [quantity, setQuantity] = useState(100);
  const [favorite, setFavorite] = useState(isFavorite);
  const [adding, setAdding] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const totalKcal = calcTotalKcal(recipe);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    if (next) {
      const { error } = await apiClient.POST("/favorites/recipes", {
        body: { recipeId: recipe.id },
      });
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się dodać do ulubionych");
      } else {
        onFavoriteToggle?.(recipe.id, true);
      }
    } else {
      const { error } = await apiClient.DELETE(
        "/favorites/recipes/{recipeId}",
        { params: { path: { recipeId: recipe.id } } },
      );
      if (error) {
        setFavorite(!next);
        showToast("error", "Błąd", "Nie udało się usunąć z ulubionych");
      } else {
        onFavoriteToggle?.(recipe.id, false);
      }
    }
  };

  const handleAdd = async () => {
    if (quantity <= 0) return;
    setAdding(true);
    await onAddToDiary(recipe, quantity);
    setAdding(false);
    setExpanded(false);
  };

  return (
    <div
      className="rounded-xl border border-[#1E3322] overflow-hidden bg-[#162218] mb-2 cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-lg bg-[#1E2D22] shrink-0 flex items-center justify-center text-lg">
          🍳
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#EAF1FC] font-medium text-sm truncate">
            {recipe.name}
          </p>
          <p className="text-[#AAB8CD] text-xs mt-0.5">
            ~{totalKcal.toFixed(0)} kcal łącznie
          </p>
        </div>
        <span className="text-[#F4C65D] font-bold font-mono text-sm shrink-0">
          {totalKcal.toFixed(0)} kcal
        </span>
        <button
          onClick={toggleFavorite}
          className="text-lg shrink-0 ml-1"
          aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      {expanded && (
        <div
          className="border-t border-[#1E3322] bg-[#1A2B1F] px-4 py-3 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="text-[#AAB8CD] text-sm shrink-0">Ilość:</label>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 bg-[#0F1A10] border border-[#1E3322] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#22C55E]"
          />
          <span className="text-[#AAB8CD] text-sm">g</span>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="ml-auto bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            {adding ? "Dodaję..." : "Dodaj do dziennika"}
          </button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Oczekiwany wynik: brak błędów.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/_components/add/RecipeCard.tsx"
git commit -m "feat: add RecipeCard with inline expand and favorite toggle"
```

---

## Task 9: ProductSearch — zakładka Produkty

**Files:**
- Create: `frontend/app/_components/add/ProductSearch.tsx`

Zakładka łączy: Recent searches (naprawia bug z zakomentowanym `addProductToDiary`), Ulubione produkty (max 5), Wyszukiwarka, Przycisk "Nowy produkt".

- [ ] **Step 1: Utwórz komponent**

Utwórz `frontend/app/_components/add/ProductSearch.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { AddProductCard } from "./ProductCard";

const searchSchema = z.object({ search: z.string().min(1, "Wpisz nazwę produktu") });
type SearchInputs = z.infer<typeof searchSchema>;

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
  createdAt: string;
};

type ProductFavorite = {
  id: string;
  productId: string;
  product: Product;
};

type RecentSearch = {
  id: string;
  productId: string;
  product: Product | null;
};

type Props = {
  onGoToNewProduct: () => void;
  newlyCreatedProduct?: Product | null;
};

export const ProductSearch = ({ onGoToNewProduct, newlyCreatedProduct }: Props) => {
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<ProductFavorite[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    newlyCreatedProduct?.id ?? null,
  );

  const { register, handleSubmit, formState: { errors } } = useForm<SearchInputs>({
    resolver: zodResolver(searchSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Załaduj recent + favorites przy montowaniu
  useEffect(() => {
    const load = async () => {
      const [recentRes, favRes] = await Promise.all([
        apiClient.GET("/recent-searches"),
        apiClient.GET("/favorites/products"),
      ]);
      if (recentRes.data) setRecentSearches(recentRes.data.recentSearches as RecentSearch[]);
      if (favRes.data) setFavoriteProducts(favRes.data.favorites as ProductFavorite[]);
    };
    load();
  }, []);

  // Jeśli dostaliśmy nowo stworzony produkt, wstaw go do wyników i otwórz
  useEffect(() => {
    if (newlyCreatedProduct) {
      setSearchResults([newlyCreatedProduct]);
      setHasSearched(true);
      setExpandedProductId(newlyCreatedProduct.id);
    }
  }, [newlyCreatedProduct]);

  const favoriteIds = new Set(favoriteProducts.map((f) => f.productId));

  const addToDiary = async (product: Product, quantity: number) => {
    const mealType = searchParams.get("mealType");
    const date = searchParams.get("date");
    if (!mealType || !date) {
      showToast("error", "Brak parametrów", "Wróć do dziennika i spróbuj ponownie");
      return;
    }

    const { error } = await apiClient.POST("/diary", {
      body: {
        date,
        productId: product.id,
        quantity,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });

    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      const kcal = ((quantity / 100) * product.calories).toFixed(0);
      showToast("success", "Dodano!", `${product.name} · ${kcal} kcal`);
      // dodaj do recent searches
      await apiClient.POST("/recent-searches", { body: { productId: product.id } });
    }
  };

  const onSubmit: SubmitHandler<SearchInputs> = async ({ search }) => {
    setIsSearching(true);
    const { data, error } = await apiClient.GET("/products/search", {
      params: { query: { search } },
    });
    setIsSearching(false);
    if (error) {
      showToast("error", "Błąd wyszukiwania", "Spróbuj ponownie");
    } else if (data) {
      setSearchResults(data.products as Product[]);
      setHasSearched(true);
    }
  };

  const recentProducts = recentSearches
    .filter((r) => r.product !== null)
    .map((r) => r.product as Product)
    .slice(0, 5);

  const showInitialState = !hasSearched;

  return (
    <div>
      {/* Pasek wyszukiwania + przycisk nowego produktu */}
      <div className="flex items-center gap-3 mb-6">
        <form
          className="flex items-center gap-2 flex-1"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            placeholder="Szukaj produktu..."
            className="flex-1 bg-[#162218] text-white placeholder-[#557060] px-4 py-2.5 rounded-xl border border-[#1E3322] focus:outline-none focus:border-[#22C55E] text-sm"
            {...register("search")}
          />
          <button
            type="submit"
            className="bg-[#16A34A] hover:bg-[#15803D] transition-colors px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
          >
            Szukaj
          </button>
        </form>
        <button
          onClick={onGoToNewProduct}
          className="shrink-0 bg-[#162218] border border-[#1E3322] hover:border-[#22C55E] transition-colors px-3 py-2.5 rounded-xl text-[#4ADE80] text-sm font-semibold"
        >
          + Nowy
        </button>
      </div>

      {errors.search && (
        <p className="text-red-400 text-sm mb-3">{errors.search.message}</p>
      )}

      {/* Wyniki wyszukiwania */}
      {hasSearched && (
        <div>
          {isSearching && (
            <p className="text-[#AAB8CD] text-sm text-center py-4">Szukam...</p>
          )}
          {!isSearching && searchResults.length === 0 && (
            <div className="text-center py-6">
              <p className="text-[#AAB8CD] mb-3">Nie znaleziono produktów</p>
              <button
                onClick={onGoToNewProduct}
                className="text-[#4ADE80] underline text-sm"
              >
                Nie znaleziono? → Dodaj nowy produkt
              </button>
            </div>
          )}
          {searchResults.map((product) => (
            <AddProductCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.has(product.id)}
              onAddToDiary={addToDiary}
              defaultExpanded={expandedProductId === product.id}
              onFavoriteToggle={(id, now) => {
                if (now) {
                  setFavoriteProducts((prev) => [
                    ...prev,
                    { id: `temp-${id}`, productId: id, product },
                  ]);
                } else {
                  setFavoriteProducts((prev) =>
                    prev.filter((f) => f.productId !== id),
                  );
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Stan początkowy: Recent + Favorites */}
      {showInitialState && (
        <>
          {recentProducts.length > 0 && (
            <section className="mb-6">
              <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase mb-3">
                Ostatnio jedzone
              </h2>
              {recentProducts.map((product) => (
                <AddProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favoriteIds.has(product.id)}
                  onAddToDiary={addToDiary}
                  onFavoriteToggle={(id, now) => {
                    if (now) {
                      setFavoriteProducts((prev) => [
                        ...prev,
                        { id: `temp-${id}`, productId: id, product },
                      ]);
                    } else {
                      setFavoriteProducts((prev) =>
                        prev.filter((f) => f.productId !== id),
                      );
                    }
                  }}
                />
              ))}
            </section>
          )}

          {favoriteProducts.length > 0 && (
            <section>
              <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase mb-3">
                Ulubione produkty
              </h2>
              {favoriteProducts.map((fav) => (
                <AddProductCard
                  key={fav.id}
                  product={fav.product}
                  isFavorite
                  onAddToDiary={addToDiary}
                  onFavoriteToggle={(id, now) => {
                    if (!now) {
                      setFavoriteProducts((prev) =>
                        prev.filter((f) => f.productId !== id),
                      );
                    }
                  }}
                />
              ))}
            </section>
          )}

          {recentProducts.length === 0 && favoriteProducts.length === 0 && (
            <p className="text-[#557060] text-sm text-center py-8">
              Wyszukaj produkt lub dodaj nowy
            </p>
          )}
        </>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Oczekiwany wynik: brak błędów.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/_components/add/ProductSearch.tsx"
git commit -m "feat: add ProductSearch tab with recent, favorites, search and inline add"
```

---

## Task 10: RecipeSearch — zakładka Przepisy

**Files:**
- Create: `frontend/app/_components/add/RecipeSearch.tsx`

- [ ] **Step 1: Utwórz komponent**

Utwórz `frontend/app/_components/add/RecipeSearch.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { RecipeCard } from "./RecipeCard";

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

export const RecipeSearch = () => {
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<RecipeFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [recipesRes, favRes] = await Promise.all([
        apiClient.GET("/recipes"),
        apiClient.GET("/favorites/recipes"),
      ]);
      if (recipesRes.data) setRecipes(recipesRes.data.recipes as Recipe[]);
      if (favRes.data) setFavorites(favRes.data.favorites as RecipeFavorite[]);
      setIsLoading(false);
    };
    load();
  }, []);

  const favoriteIds = new Set(favorites.map((f) => f.recipeId));

  const addToDiary = async (recipe: Recipe, quantity: number) => {
    const mealType = searchParams.get("mealType");
    const date = searchParams.get("date");
    if (!mealType || !date) {
      showToast("error", "Brak parametrów", "Wróć do dziennika i spróbuj ponownie");
      return;
    }

    const { error } = await apiClient.POST("/diary", {
      body: {
        date,
        recipeId: recipe.id,
        quantity,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });

    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      showToast("success", "Dodano!", `${recipe.name} · ${quantity}g`);
    }
  };

  const handleFavoriteToggle = (recipeId: string, nowFavorite: boolean) => {
    if (!nowFavorite) {
      setFavorites((prev) => prev.filter((f) => f.recipeId !== recipeId));
    }
  };

  if (isLoading) {
    return <p className="text-[#AAB8CD] text-sm text-center py-8">Ładowanie...</p>;
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#AAB8CD] mb-4">Nie masz jeszcze żadnych przepisów</p>
        <Link
          href="/dashboard/recipe-builder"
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          → Przejdź do kreatora przepisów
        </Link>
      </div>
    );
  }

  const favoriteRecipes = favorites.map((f) => f.recipe);
  const allOtherRecipes = recipes.filter((r) => !favoriteIds.has(r.id));

  return (
    <div>
      {favoriteRecipes.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase mb-3">
            Ulubione przepisy
          </h2>
          {favoriteRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite
              onAddToDiary={addToDiary}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </section>
      )}

      <section>
        <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase mb-3">
          Wszystkie przepisy
        </h2>
        {allOtherRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavorite={false}
            onAddToDiary={addToDiary}
            onFavoriteToggle={(id, now) => {
              if (now) {
                setFavorites((prev) => [
                  ...prev,
                  { id: `temp-${id}`, recipeId: id, recipe },
                ]);
              }
            }}
          />
        ))}
        {allOtherRecipes.length === 0 && favoriteRecipes.length > 0 && (
          <p className="text-[#557060] text-sm text-center py-4">
            Wszystkie przepisy są w ulubionych
          </p>
        )}
      </section>
    </div>
  );
};
```

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Oczekiwany wynik: brak błędów.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/_components/add/RecipeSearch.tsx"
git commit -m "feat: add RecipeSearch tab with favorites and inline diary add"
```

---

## Task 11: Refaktor strony AddPage — 3 zakładki

**Files:**
- Modify: `frontend/app/dashboard/add/page.tsx`

Strona zarządza aktywną zakładką przez URL search param `?tab=products|recipes|new`. Przekazuje callback `onGoToNewProduct` do `ProductSearch`, a `onSuccess` do `ProductForm` w zakładce New.

- [ ] **Step 1: Zastąp zawartość page.tsx**

Zastąp całą zawartość `frontend/app/dashboard/add/page.tsx`:

```typescript
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductSearch } from "@/app/_components/add/ProductSearch";
import { RecipeSearch } from "@/app/_components/add/RecipeSearch";
import { ProductForm } from "@/app/_components/shared/ProductForm";

type Tab = "products" | "recipes" | "new";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
  createdAt: string;
};

function AddPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = (searchParams.get("tab") as Tab) ?? "products";
  const [newlyCreatedProduct, setNewlyCreatedProduct] = useState<Product | null>(null);

  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  const handleNewProductSuccess = (product: Product) => {
    setNewlyCreatedProduct(product);
    setTab("products");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "products", label: "Produkty" },
    { id: "recipes", label: "Przepisy" },
    { id: "new", label: "+ Nowy produkt" },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-[#F3F7FF] text-2xl font-bold mb-6">Dodaj wpis</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111C14] p-1 rounded-xl border border-[#1E3322]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              currentTab === tab.id
                ? "bg-[#16A34A] text-white shadow"
                : "text-[#AAB8CD] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {currentTab === "products" && (
        <ProductSearch
          onGoToNewProduct={() => setTab("new")}
          newlyCreatedProduct={newlyCreatedProduct}
        />
      )}

      {currentTab === "recipes" && <RecipeSearch />}

      {currentTab === "new" && (
        <div className="bg-[#111C14] rounded-2xl border border-[#1E3322] p-6">
          <ProductForm onSuccess={handleNewProductSuccess} />
        </div>
      )}
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense>
      <AddPageContent />
    </Suspense>
  );
}
```

> **Dlaczego Suspense?** `useSearchParams()` w Next.js App Router wymaga Suspense boundary żeby działać po stronie klienta bez błędu.

- [ ] **Step 2: Sprawdź TypeScript**

```bash
cd frontend
npx tsc --noEmit
```

Oczekiwany wynik: brak błędów.

- [ ] **Step 3: Uruchom frontend i przetestuj ręcznie**

```bash
cd frontend
npm run dev
```

Otwórz `http://localhost:3000/dashboard/add?mealType=BREAKFAST&date=2026-04-16`:

1. Widoczne są 3 zakładki — kliknięcie każdej zmienia URL `?tab=`
2. Zakładka Produkty: przy braku recent/favorites widać komunikat "Wyszukaj produkt lub dodaj nowy"
3. Wyszukaj produkt → kliknięcie karty rozszerza ją in-place z polem ilości (domyślnie 100g)
4. Kliknięcie "Dodaj do dziennika" → toast sukcesu, karta się zwija
5. Serduszko toggleuje ulubione (zmiana natychmiastowa, bez odświeżenia)
6. Po wyszukaniu z 0 wynikami widać "Nie znaleziono? → Dodaj nowy produkt"
7. Zakładka "+ Nowy produkt" → formularz wbudowany bez modala
8. Po zapisaniu nowego produktu → redirect do "Produkty" z kartą nowego produktu otwartą
9. Zakładka Przepisy → lista przepisów z kartami

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/dashboard/add/page.tsx"
git commit -m "feat: redesign add page with 3 tabs, inline expand, and favorites"
```

---

## Self-review — weryfikacja spec coverage

| Wymaganie z spec | Task który to implementuje |
|-----------------|---------------------------|
| 3 zakładki z URL param `?tab=` | Task 11 |
| Ostatnio jedzone (max 5, naprawa buga) | Task 9 — `addToDiary` podłączone do recent, bug naprawiony |
| Ulubione produkty GET `/favorites/products` | Task 1-5 (backend) + Task 9 (frontend) |
| Inline expand z polem ilości (default 100g) | Task 7 (`AddProductCard`) |
| Serduszko toggle optimistic | Task 7, Task 8 |
| "Nowy produkt" button zawsze widoczny | Task 9 — przycisk w headerze search |
| Reminder "Nie znaleziono?" | Task 9 — puste wyniki |
| Zakładka Przepisy — ulubione | Task 1-5 (backend) + Task 10 (frontend) |
| Zakładka Przepisy — wszystkie przepisy | Task 10 — `GET /recipes` |
| Inline expand przepisu | Task 8 (`RecipeCard`) |
| Link do recipe-builder gdy brak przepisów | Task 10 |
| Nowy produkt wbudowany w zakładkę | Task 11 |
| Po zapisaniu redirect + inline expand nowego | Task 6, Task 11 |
| Backend — Prisma models | Task 1 |
| Backend — 6 endpointów favorites | Task 4 |

Wszystkie wymagania pokryte. Nie ma placeholderów.
