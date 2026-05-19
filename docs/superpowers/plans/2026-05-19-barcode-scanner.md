# Barcode Scanner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add EAN barcode scanning to the diet tracker — users scan to find products in the diary, admins scan to auto-fill the product form from Open Food Facts.

**Architecture:** A shared `BarcodeScanner` component wraps `react-zxing` (camera + decode). A `BarcodeScannerModal` manages state and API calls. Backend adds `GET /products/barcode/:code` — DB lookup first, then Open Food Facts for admins (role read from JWT already in cookie).

**Tech Stack:** react-zxing, Open Food Facts REST API (free, no key), Prisma migration, Zod, Vitest/Supertest

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `backend/prisma/schema.prisma` | Add `barcode String? @unique` to Product |
| Modify | `backend/src/schemas/productSchema.ts` | Add barcode validation + barcode to productSchema |
| Modify | `backend/src/services/productService.ts` | Add `getProductByBarcode` + export `BarcodeProductResult` |
| Modify | `backend/src/controllers/productController.ts` | Add `getProductByBarcodeController` |
| Modify | `backend/src/routes/productRoutes.ts` | Register `GET /barcode/:code` before `/:id` |
| Modify | `backend/src/__tests__/product.test.ts` | Add tests + fix existing mocks (add `barcode: null`) |
| Modify | `frontend/schemas/productSchem.ts` | Add optional `barcode` field |
| Create | `frontend/app/_components/barcode/BarcodeScanner.tsx` | Camera view + ZXing decode, calls `onScan(code)` |
| Create | `frontend/app/_components/barcode/BarcodeScannerModal.tsx` | Modal wrapper: scan → fetch → pass result to parent |
| Modify | `frontend/app/_components/add/ProductSearch.tsx` | Add camera button + modal → found product auto-selects |
| Modify | `frontend/app/_components/shared/ProductForm.tsx` | Add barcode field + scanner button + setValue on scan |

---

### Task 1: Add barcode column to database

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/__tests__/product.test.ts` (fix mocks)

- [ ] **Step 1: Add barcode field to Product model**

In `backend/prisma/schema.prisma`, find the `model Product` block and add one line:

```prisma
model Product {
  id           String        @id @default(uuid())
  name         String        @unique
  calories     Decimal
  carbs        Decimal
  protein      Decimal
  fat          Decimal
  imageUrl     String        @default("")
  barcode      String?       @unique
  createdAt    DateTime      @default(now())
  diaryEntriesItems DiaryEntryItem[]
  recipeIngredient RecipeIngredient[]
  recentSearches RecentSearch[]
  productFavorites ProductFavorite[]
  UserRecipeIngredient UserRecipeIngredient[]
}
```

- [ ] **Step 2: Run migration**

```bash
cd "backend"
npx prisma migrate dev --name add-barcode-to-product
```

Expected: `The following migration(s) have been created and applied from new schema changes: migrations/..._add_barcode_to_product`

- [ ] **Step 3: Fix existing test mocks — add barcode: null**

The Prisma `Product` type now includes `barcode: string | null`. All `mockResolvedValue` calls in `backend/src/__tests__/product.test.ts` that return a Product object need `barcode: null` added.

Find every object shaped like:
```typescript
{
  name: 'Test product',
  calories: new Decimal(100),
  carbs: new Decimal(100),
  protein: new Decimal(100),
  fat: new Decimal(100),
  id: productId,
  createdAt: new Date(),
  imageUrl: '',
}
```

And add `barcode: null` to each:
```typescript
{
  name: 'Test product',
  calories: new Decimal(100),
  carbs: new Decimal(100),
  protein: new Decimal(100),
  fat: new Decimal(100),
  id: productId,
  createdAt: new Date(),
  imageUrl: '',
  barcode: null,
}
```

There are 7 such objects in the file (createProduct, getProducts, getProduct×2, searchProducts, updateProduct, deleteProduct mocks).

- [ ] **Step 4: Run existing tests to verify no regressions**

```bash
cd "backend"
npx vitest run src/__tests__/product.test.ts
```

Expected: all existing tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations backend/src/__tests__/product.test.ts
git commit -m "feat: add barcode column to Product model"
```

---

### Task 2: Add barcode schema validation to backend

**Files:**
- Modify: `backend/src/schemas/productSchema.ts`

- [ ] **Step 1: Add barcodeCodeSchema and barcode to productSchema**

Replace the full content of `backend/src/schemas/productSchema.ts`:

```typescript
import { z } from 'zod';
import { registry } from '../swagger';

export const productSchema = registry.register(
    'Product',
    z.object({
        name: z.string().min(1, 'Name is required'),
        calories: z.number().nonnegative('Calories must be a positive number'),
        carbs: z.number().nonnegative('Carbs must be a positive number'),
        protein: z.number().nonnegative('Protein must be a positive number'),
        fat: z.number().nonnegative('Fat must be a positive number'),
        imageUrl: z.string().optional(),
        barcode: z.string().optional(),
    }),
);

export const updateProductSchema = productSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const productIdSchema = z.uuid({ message: 'Product ID must be a valid UUID' });

export const searchProductSchema = z.object({
    search: z.string().min(1, 'Search term is required'),
});

export const barcodeCodeSchema = z
    .string()
    .regex(/^\d{8}$|^\d{13}$/, 'Barcode must be 8 or 13 digits');
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "backend"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/schemas/productSchema.ts
git commit -m "feat: add barcodeCodeSchema and barcode field to productSchema"
```

---

### Task 3: Add getProductByBarcode to product service

**Files:**
- Modify: `backend/src/services/productService.ts`

- [ ] **Step 1: Write the failing test first**

Add this describe block to `backend/src/__tests__/product.test.ts`.

First, add `getProductByBarcode` to the import at the top of the test file:
```typescript
import {
    createProduct,
    getAllProducts,
    getProductById,
    searchProductsService,
    updateProductValues,
    deleteProductService,
    getProductByBarcode,
} from '../services/productService';
```

Then add the test block at the end of the file:
```typescript
describe('GET /api/v1/products/barcode/:code', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return 200 when product found by barcode', async () => {
        vi.mocked(getProductByBarcode).mockResolvedValue({
            id: productId,
            name: 'Test product',
            calories: 100,
            protein: 100,
            carbs: 100,
            fat: 100,
            barcode: '5901234123457',
            imageUrl: '',
            source: 'database',
        });

        const res = await request(app)
            .get('/api/v1/products/barcode/5901234123457')
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(200);
        expect(res.body.product.barcode).toBe('5901234123457');
        expect(res.body.product.source).toBe('database');
    });

    it('should return 404 when product not found', async () => {
        vi.mocked(getProductByBarcode).mockRejectedValue(new AppError('Product not found', 404));

        const res = await request(app)
            .get('/api/v1/products/barcode/5901234123457')
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(404);
    });

    it('should return 400 when barcode format is invalid', async () => {
        const res = await request(app)
            .get('/api/v1/products/barcode/NOTABARCODE')
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
        const res = await request(app).get('/api/v1/products/barcode/5901234123457');
        expect(res.status).toBe(401);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "backend"
npx vitest run src/__tests__/product.test.ts
```

Expected: FAIL — `getProductByBarcode` not found in service.

- [ ] **Step 3: Add BarcodeProductResult type and getProductByBarcode to service**

Add to the end of `backend/src/services/productService.ts`:

```typescript
export type BarcodeProductResult = {
    id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    barcode: string;
    imageUrl: string;
    source: 'database' | 'open_food_facts';
};

type OpenFoodFactsResponse = {
    status: number;
    product?: {
        product_name?: string;
        nutriments?: {
            'energy-kcal_100g'?: number;
            'proteins_100g'?: number;
            'carbohydrates_100g'?: number;
            'fat_100g'?: number;
        };
    };
};

export const getProductByBarcode = async (code: string, isAdmin: boolean): Promise<BarcodeProductResult> => {
    const product = await prisma.product.findUnique({
        where: { barcode: code },
    });

    if (product) {
        return {
            id: product.id,
            name: product.name,
            calories: Number(product.calories),
            protein: Number(product.protein),
            carbs: Number(product.carbs),
            fat: Number(product.fat),
            barcode: code,
            imageUrl: product.imageUrl,
            source: 'database',
        };
    }

    if (!isAdmin) {
        throw new AppError('Product not found', 404);
    }

    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);

    if (!response.ok) {
        throw new AppError('Product not found', 404);
    }

    const json: OpenFoodFactsResponse = await response.json();

    if (json.status !== 1 || !json.product) {
        throw new AppError('Product not found', 404);
    }

    const off = json.product;

    return {
        name: off.product_name ?? '',
        calories: off.nutriments?.['energy-kcal_100g'] ?? 0,
        protein: off.nutriments?.['proteins_100g'] ?? 0,
        carbs: off.nutriments?.['carbohydrates_100g'] ?? 0,
        fat: off.nutriments?.['fat_100g'] ?? 0,
        barcode: code,
        imageUrl: '',
        source: 'open_food_facts',
    };
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd "backend"
npx vitest run src/__tests__/product.test.ts
```

Expected: all tests pass including new barcode tests.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/productService.ts backend/src/__tests__/product.test.ts
git commit -m "feat: add getProductByBarcode service with Open Food Facts fallback"
```

---

### Task 4: Add barcode controller and route

**Files:**
- Modify: `backend/src/controllers/productController.ts`
- Modify: `backend/src/routes/productRoutes.ts`

- [ ] **Step 1: Add getProductByBarcodeController to controller file**

Add this import at the top of `backend/src/controllers/productController.ts`:
```typescript
import {
    createProduct as createProductService,
    getAllProducts,
    getProductById,
    updateProductValues,
    deleteProductService,
    searchProductsService,
    getProductByBarcode as getProductByBarcodeService,
} from '../services/productService';
import { productSchema, productIdSchema, updateProductSchema, searchProductSchema, barcodeCodeSchema } from '../schemas/productSchema';
import { Role } from '../generated/prisma';
```

Then add this function at the end of `backend/src/controllers/productController.ts`:

```typescript
export const getProductByBarcodeController = async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;

    const result = barcodeCodeSchema.safeParse(code);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid barcode format — must be 8 or 13 digits' });
        return;
    }

    try {
        const isAdmin = req.role === Role.ADMIN;
        const product = await getProductByBarcodeService(result.data, isAdmin);
        res.status(200).json({ product });
    } catch (error) {
        next(error);
    }
};
```

- [ ] **Step 2: Register the route BEFORE /:id**

Replace the full content of `backend/src/routes/productRoutes.ts`:

```typescript
import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductByBarcodeController,
} from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/barcode/:code', getProductByBarcodeController);
router.get('/:id', getProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
```

Note: `/barcode/:code` must come before `/:id` — Express matches top-down.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "backend"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run all product tests**

```bash
cd "backend"
npx vitest run src/__tests__/product.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/productController.ts backend/src/routes/productRoutes.ts
git commit -m "feat: add GET /products/barcode/:code endpoint"
```

---

### Task 5: Install react-zxing on frontend

**Files:**
- Modify: `frontend/package.json` (via npm install)

- [ ] **Step 1: Install library**

```bash
cd "frontend"
npm install react-zxing
```

Expected: `react-zxing` appears in `frontend/package.json` dependencies.

- [ ] **Step 2: Verify TypeScript sees the types**

```bash
cd "frontend"
npx tsc --noEmit
```

Expected: no errors related to react-zxing.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "feat: install react-zxing for barcode scanning"
```

---

### Task 6: Update frontend product schema

**Files:**
- Modify: `frontend/schemas/productSchem.ts`

- [ ] **Step 1: Add optional barcode field**

Replace full content of `frontend/schemas/productSchem.ts`:

```typescript
import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    calories: z.number().nonnegative('Calories must be a positive number'),
    carbs: z.number().nonnegative('Carbs must be a positive number'),
    protein: z.number().nonnegative('Protein must be a positive number'),
    fat: z.number().nonnegative('Fat must be a positive number'),
    barcode: z.string().optional(),
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "frontend"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/schemas/productSchem.ts
git commit -m "feat: add barcode field to frontend product schema"
```

---

### Task 7: Create BarcodeScanner component

**Files:**
- Create: `frontend/app/_components/barcode/BarcodeScanner.tsx`

- [ ] **Step 1: Create the component**

Create file `frontend/app/_components/barcode/BarcodeScanner.tsx`:

```tsx
"use client";

import { useZxing } from "react-zxing";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner = ({ onScan, onError }: BarcodeScannerProps) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError(error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    },
  });

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video ref={ref} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-52 h-20 border-2 border-[#4ADE80] rounded-lg opacity-80" />
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-[#8FA0B8]">
        Ustaw kod kreskowy w ramce
      </p>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "frontend"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/_components/barcode/BarcodeScanner.tsx
git commit -m "feat: add BarcodeScanner component with react-zxing"
```

---

### Task 8: Create BarcodeScannerModal component

**Files:**
- Create: `frontend/app/_components/barcode/BarcodeScannerModal.tsx`

- [ ] **Step 1: Create the component**

Create file `frontend/app/_components/barcode/BarcodeScannerModal.tsx`:

```tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BarcodeScanner } from "./BarcodeScanner";

type ScanState = "scanning" | "loading" | "not_found" | "camera_error";

export type ScannedProduct = {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  barcode: string;
  imageUrl: string;
  source: "database" | "open_food_facts";
};

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: ScannedProduct) => void;
}

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onProductFound,
}: BarcodeScannerModalProps) => {
  const [state, setState] = useState<ScanState>("scanning");
  const hasScanned = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setState("scanning");
      hasScanned.current = false;
    }
  }, [isOpen]);

  const handleScan = useCallback(
    async (code: string) => {
      if (hasScanned.current) return;
      hasScanned.current = true;
      setState("loading");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/barcode/${code}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setState("not_found");
          return;
        }

        const data = await res.json();
        onProductFound(data.product);
        onClose();
      } catch {
        setState("not_found");
      }
    },
    [onProductFound, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#111C14] border border-[#1E3322] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Skanuj kod kreskowy</h2>
          <button
            onClick={onClose}
            className="text-[#8FA0B8] hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {state === "scanning" && (
          <BarcodeScanner
            onScan={handleScan}
            onError={() => setState("camera_error")}
          />
        )}

        {state === "loading" && (
          <div className="flex items-center justify-center py-16">
            <p className="text-[#8FA0B8] text-sm">Wyszukuję produkt...</p>
          </div>
        )}

        {state === "not_found" && (
          <div className="text-center py-10">
            <p className="text-[#8FA0B8] mb-5 text-sm">Nie znaleziono produktu.</p>
            <button
              onClick={() => { hasScanned.current = false; setState("scanning"); }}
              className="text-[#4ADE80] text-sm font-semibold"
            >
              Skanuj ponownie
            </button>
          </div>
        )}

        {state === "camera_error" && (
          <div className="text-center py-10">
            <p className="text-[#8FA0B8] mb-5 text-sm">
              Brak dostępu do kamery. Sprawdź uprawnienia w przeglądarce.
            </p>
            <button
              onClick={onClose}
              className="text-[#4ADE80] text-sm font-semibold"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "frontend"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/_components/barcode/BarcodeScannerModal.tsx
git commit -m "feat: add BarcodeScannerModal component"
```

---

### Task 9: Integrate barcode scanner into ProductSearch (diary)

**Files:**
- Modify: `frontend/app/_components/add/ProductSearch.tsx`

- [ ] **Step 1: Add imports and camera support check**

At the top of `frontend/app/_components/add/ProductSearch.tsx`, add these imports after the existing ones:

```typescript
import { BarcodeScannerModal, type ScannedProduct } from "@/app/_components/barcode/BarcodeScannerModal";
```

Inside the `ProductSearch` component, after the existing state declarations, add:

```typescript
const [isScannerOpen, setIsScannerOpen] = useState(false);
const isCameraSupported =
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
```

- [ ] **Step 2: Add handler for found product**

Add this function inside `ProductSearch`, before the `return`:

```typescript
const handleBarcodeFound = (scannedProduct: ScannedProduct) => {
  if (scannedProduct.source === "database" && scannedProduct.id) {
    const product: Product = {
      id: scannedProduct.id,
      name: scannedProduct.name,
      calories: scannedProduct.calories,
      carbs: scannedProduct.carbs,
      protein: scannedProduct.protein,
      fat: scannedProduct.fat,
      imageUrl: scannedProduct.imageUrl,
      createdAt: new Date().toISOString(),
    };
    setSearchResults([product]);
    setHasSearched(true);
    setExpandedProductId(product.id);
  }
};
```

- [ ] **Step 3: Add camera button next to search field**

In the JSX, find the `<div className="flex items-center gap-2 mb-5">` block. After the closing `</form>` tag and before the "Nowy" button, insert:

```tsx
{isCameraSupported && (
  <button
    type="button"
    onClick={() => setIsScannerOpen(true)}
    title="Skanuj kod kreskowy"
    className="shrink-0 flex items-center gap-1.5 bg-[#1A2E1A] border border-[#22C55E40] hover:border-[#22C55E] transition-colors px-3 py-2.5 rounded-xl text-[#4ADE80]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="#4ADE80"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="14" y1="14" x2="14" y2="21" />
      <line x1="14" y1="14" x2="21" y2="14" />
      <line x1="21" y1="17" x2="21" y2="21" />
      <line x1="17" y1="21" x2="21" y2="21" />
    </svg>
  </button>
)}
```

- [ ] **Step 4: Mount BarcodeScannerModal**

At the very end of the `return` block, before the closing `</div>`, add:

```tsx
<BarcodeScannerModal
  isOpen={isScannerOpen}
  onClose={() => setIsScannerOpen(false)}
  onProductFound={handleBarcodeFound}
/>
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd "frontend"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/_components/add/ProductSearch.tsx
git commit -m "feat: add barcode scanner button to diary product search"
```

---

### Task 10: Integrate barcode scanner into ProductForm (admin)

**Files:**
- Modify: `frontend/app/_components/shared/ProductForm.tsx`

- [ ] **Step 1: Add import and expose setValue from useForm**

At the top of `frontend/app/_components/shared/ProductForm.tsx`, add the import:

```typescript
import { BarcodeScannerModal, type ScannedProduct } from "@/app/_components/barcode/BarcodeScannerModal";
```

Find the `useForm` destructuring and add `setValue` and `reset`:

```typescript
const {
  register,
  handleSubmit,
  setValue,
  formState: { errors },
} = useForm<Inputs>({
  resolver: zodResolver(productSchema),
  mode: "onSubmit",
  reValidateMode: "onSubmit",
  defaultValues: initialValues,
});
```

Also add scanner state after existing state declarations:

```typescript
const [isScannerOpen, setIsScannerOpen] = useState(false);
const isCameraSupported =
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
```

- [ ] **Step 2: Add handler to fill form from scan**

Add this function inside `ProductForm`, before `onSubmit`:

```typescript
const handleBarcodeFound = (scannedProduct: ScannedProduct) => {
  setValue("name", scannedProduct.name);
  setValue("calories", scannedProduct.calories);
  setValue("protein", scannedProduct.protein);
  setValue("carbs", scannedProduct.carbs);
  setValue("fat", scannedProduct.fat);
  setValue("barcode", scannedProduct.barcode);
};
```

- [ ] **Step 3: Add barcode scanner button above the form**

In the JSX, find `<form className="flex flex-col gap-5" ...>`. Before it (outside the form), add:

```tsx
{isCameraSupported && !productToEdit && (
  <button
    type="button"
    onClick={() => setIsScannerOpen(true)}
    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#1A2E1A] border border-[#22C55E40] hover:border-[#22C55E] transition-colors px-3 py-2.5 text-[#4ADE80] text-sm font-semibold mb-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="#4ADE80"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="14" y1="14" x2="14" y2="21" />
      <line x1="14" y1="14" x2="21" y2="14" />
      <line x1="21" y1="17" x2="21" y2="21" />
      <line x1="17" y1="21" x2="21" y2="21" />
    </svg>
    Skanuj kod kreskowy
  </button>
)}
```

- [ ] **Step 4: Add barcode input field to the form**

In the form JSX, after the `fat` input block and before the `imageUrl` input block, add:

```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="barcode" className={labelClass}>
    Kod kreskowy <span className="text-gray-500">(opcjonalne)</span>
  </label>
  <input
    type="text"
    id="barcode"
    className={inputClass}
    placeholder="np. 5901234123457"
    {...register("barcode")}
  />
  {errors.barcode && (
    <p className="text-sm text-red-400">{errors.barcode.message}</p>
  )}
</div>
```

- [ ] **Step 5: Mount BarcodeScannerModal**

At the end of the component's return, before the final closing tag, add:

```tsx
<BarcodeScannerModal
  isOpen={isScannerOpen}
  onClose={() => setIsScannerOpen(false)}
  onProductFound={handleBarcodeFound}
/>
```

- [ ] **Step 6: Update addProduct to send barcode field**

The `preparedData` in `addProduct` already spreads `data` from the form, which now includes `barcode`. No change needed — Zod schema passes it through.

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd "frontend"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/app/_components/shared/ProductForm.tsx
git commit -m "feat: add barcode scanner to admin product form with auto-fill"
```

---

## Manual Testing Checklist

After all tasks are complete, test these flows manually:

**Diary (user flow):**
- [ ] Open `/dashboard/add`, click barcode icon
- [ ] Scan a product barcode that exists in your DB → product appears expanded in results
- [ ] Scan a barcode that doesn't exist → "Nie znaleziono produktu" message
- [ ] Click "Skanuj ponownie" → camera restarts
- [ ] On desktop without camera → barcode button is hidden

**Admin product form:**
- [ ] Open the product add form as admin
- [ ] Click "Skanuj kod kreskowy"
- [ ] Scan a barcode of a real product (e.g., from a food item)
- [ ] Form fields fill automatically from Open Food Facts
- [ ] Barcode field shows the scanned code
- [ ] Edit any field, submit → product saved with barcode
- [ ] Try scanning a product already in your DB → fields fill from DB data

**Edge cases:**
- [ ] Scan very quickly twice → second scan doesn't trigger while first is loading
- [ ] Close modal mid-scan → camera stops, no memory leak
