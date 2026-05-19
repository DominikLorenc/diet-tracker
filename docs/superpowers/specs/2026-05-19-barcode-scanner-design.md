# Barcode Scanner — Specyfikacja

## Cel

Umożliwienie skanowania kodów kreskowych EAN-13 z opakowań produktów spożywczych w dwóch miejscach aplikacji:
1. Dziennik — znajdź produkt po kodzie i dodaj do wpisu
2. Formularz admina — skanuj kod przy dodawaniu produktu do bazy

## Uprawnienia

- **Zwykły user** — może skanować kody w dzienniku. Wynik pochodzi z własnej bazy lub Open Food Facts (tymczasowo, bez zapisu do DB). Jeśli produkt nie znaleziony nigdzie — komunikat błędu.
- **Admin** — może skanować kod w formularzu dodawania produktu. Open Food Facts wypełnia formularz automatycznie. Admin weryfikuje i zapisuje do bazy.

Żaden produkt nie trafia do bazy bez świadomej akcji admina.

## Stack

- Biblioteka skanowania: `react-zxing` (wrapper na ZXing, obsługuje EAN-13, cross-browser, React-friendly)
- Zewnętrzne API: Open Food Facts (`https://world.openfoodfacts.org/api/v2/product/:code`)

## Zmiany w bazie danych

```prisma
model Product {
  // ... istniejące pola bez zmian
  barcode String? @unique  // nowe pole — opcjonalne, unikalne
}
```

Migracja Prisma: `npx prisma migrate dev --name add-barcode-to-product`

## Backend

### Nowy endpoint

```
GET /api/products/barcode/:code
```

**Logika (productService.ts):**

1. Szukaj w DB: `Product.findFirst({ where: { barcode: code } })`
2. Znaleziono → zwróć `{ ...product, source: "database" }` (200)
3. Nie znaleziono → odpytaj Open Food Facts API
4. Znaleziono w OFF → zmapuj dane → zwróć `{ name, calories, protein, carbs, fat, barcode: code, source: "open_food_facts" }` (200)
5. Nie znaleziono nigdzie → zwróć 404

**Mapowanie danych z Open Food Facts:**

```typescript
{
  name:     product.product_name || "",
  calories: product.nutriments["energy-kcal_100g"] ?? 0,
  protein:  product.nutriments["proteins_100g"] ?? 0,
  carbs:    product.nutriments["carbohydrates_100g"] ?? 0,
  fat:      product.nutriments["fat_100g"] ?? 0,
}
```

Brakujące pola domyślnie `0`. Pole `source` informuje frontend czy produkt jest "swój" czy "zewnętrzny".

**Walidacja:** `code` musi być ciągiem cyfr (8 lub 13 znaków — EAN-8 i EAN-13).

## Frontend — komponenty

```
frontend/components/barcode/
  BarcodeScanner.tsx        — otwiera kamerę, zwraca kod przez onScan(code: string)
  BarcodeScannerModal.tsx   — modal z BarcodeScanner, zarządza fetchem i stanem
```

### BarcodeScanner.tsx

"Głupi" komponent — tylko skanuje, nic nie wie o produktach.

```typescript
interface BarcodeScannerProps {
  onScan: (code: string) => void
  onError?: (error: Error) => void
}
```

Używa `useZxing` z `react-zxing`. Po odczycie wywołuje `onScan` i zatrzymuje kamerę.

### BarcodeScannerModal.tsx

Zarządza całym przepływem: otwiera modal → skanuje → fetchuje endpoint → przekazuje wynik do rodzica.

```typescript
interface BarcodeScannerModalProps {
  onProductFound: (product: ScannedProduct) => void
  onNotFound: () => void
}

interface ScannedProduct {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  barcode: string
  source: "database" | "open_food_facts"
}
```

**Stany modala:**
- `scanning` — kamera aktywna
- `loading` — trwa fetch do backendu
- `found` — produkt znaleziony, przekazuje dane do rodzica
- `not_found` — komunikat błędu

## Integracja — Miejsce 1: Dziennik

Przy polu wyszukiwania produktów pojawia się ikonka aparatu (przycisk). Kliknięcie otwiera `BarcodeScannerModal`.

**Po znalezieniu produktu (`source: "database"`):**
- Modal zmienia widok na formularz "dodaj do dziennika" z wypełnionymi danymi
- User wybiera porcję i potwierdza

**Po znalezieniu produktu (`source: "open_food_facts"`):**
- Komunikat: "Produkt znaleziony w Open Food Facts, ale nie ma go jeszcze w naszej bazie. Poproś administratora o jego dodanie."
- User nie może dodać go do dziennika — `DiaryEntryItem` wymaga istniejącego `productId` w DB
- Pokazujemy podgląd danych (nazwa, kalorie, makro) żeby user wiedział o co chodzi

**Produkt nie znaleziony:**
- Komunikat: "Nie znaleziono produktu. Skontaktuj się z administratorem."

## Integracja — Miejsce 2: Formularz admina

Przycisk "Skanuj kod kreskowy" nad formularzem dodawania produktu.

**Po odczycie kodu:**
- Fetch do `/api/products/barcode/:code`
- Znaleziono w OFF → pola formularza (name, calories, protein, carbs, fat, barcode) wypełniają się automatycznie
- Admin weryfikuje dane i może je edytować
- Nie znaleziono → tylko pole `barcode` wypełnione, reszta ręcznie

## Obsługa błędów

| Sytuacja | Zachowanie |
|---|---|
| Brak dostępu do kamery | Komunikat "Brak dostępu do kamery. Sprawdź uprawnienia." |
| Przeglądarka nie wspiera | Ukryj przycisk skanowania, tylko wyszukiwanie tekstowe |
| Open Food Facts timeout | Traktuj jak 404, zwróć błąd do frontendu |
| Niepełne dane w OFF | Wypełnij tym co jest, brakujące pola = 0 |

## Co NIE jest w tym zakresie

- Skanowanie QR kodów
- Historia skanowań
- Masowe importowanie produktów z OFF do bazy
- Edycja danych produktu przez zwykłego usera
