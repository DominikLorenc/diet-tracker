# Przeglądanie listy wszystkich produktów — design

> Data: 2026-06-03
> Dotyczy: `/dashboard/all` (`AllProducts`) + `GET /products`

## Kontekst

`/dashboard/all` renderuje pełną listę globalnego katalogu produktów (`Product`).
Dziś `GET /products` → `getAllProducts()` = `prisma.product.findMany()` bez
parametrów: zwraca wszystko, bez sortowania i bez paginacji. Przy zakładanej
skali katalogu (tysiące+) pobieranie całości do przeglądarki przestaje mieć sens.

Osobny `GET /products/search?search=` (zwraca top 10, `name contains`) obsługuje
`<Search />` na `/dashboard/products` — **pozostaje nietknięty**, robi co innego
(szybkie podpowiedzi).

Jedyny konsument `GET /products` na froncie to `allProducts.tsx` — zmiana kształtu
odpowiedzi nie psuje innych ekranów. Backendowy `product.test.ts` sprawdza tylko
`status === 200`, nie kształt — też bezpieczny.

## Cel

Ulepszyć przeglądanie listy: szukanie po nazwie, paginacja, czytelniejszy układ.

## Zakres

**W zakresie:**
- Server-side **search** po nazwie (`contains`, case-insensitive)
- Server-side **offset pagination**
- Frontend: pole szukania (debounce), kontrolki paginacji, **układ siatki**

**Poza zakresem (YAGNI):**
- Sortowanie wybierane przez użytkownika (produkty nie mają jeszcze kategorii/tagów;
  łatwo dodać później)
- Cursor pagination / infinite scroll (over-engineering dla skali „tysiące")
- Testy frontendowe (brak infrastruktury — osobny dług techniczny ze STATUS.md)

## Backend — `GET /products` z parametrami

### Query params

`?search=&page=&limit=`

### Walidacja (Zod, query schema)

- `page` → coerce do int, min 1, **default 1**
- `limit` → coerce do int, min 1, **przycięcie do max 100** (`.transform(v => Math.min(v, 100))`), **default 20**
  - cap `limit` chroni przed `limit=999999` (mini-DoS / wyczerpanie pamięci) — OWASP
  - zachowanie: wartość powyżej 100 jest **cicho przycinana** do 100 (nie 400)
- `search` → opcjonalny string, `trim`, rozsądny max długości

### Service `getAllProducts({ search, page, limit })`

- `where = search ? { name: { contains: search, mode: "insensitive" } } : {}`
- **`orderBy: { name: "asc" }`** (alfabetycznie) — kolejność deterministyczna jest
  konieczna; offset bez stabilnego `ORDER BY` daje niestabilne strony (ta sama
  pozycja może trafić na dwie strony albo zniknąć)
- `prisma.$transaction([` `findMany({ where, orderBy, skip: (page-1)*limit, take: limit })`,
  `count({ where })` `])` — lista + total w jednym przejściu
- zwraca `{ products, total, page, limit }`

### Typy (OpenAPI)

`apiClient` jest typowany z definicji OpenAPI w `backend/src/docs/`. Po zmianie
kształtu odpowiedzi trzeba zaktualizować definicję i **przegenerować typy frontu**,
inaczej TypeScript się nie zgodzi.

## Frontend — przepisanie `AllProducts`

### Stan

- `products`, `total`, `page`, `search`, `isLoading`
- pochodne: `totalPages = Math.ceil(total / limit)` (limit = 20)

### Zachowania

- **Search:** input z debounce ~300 ms; zmiana frazy resetuje `page = 1`
- **Fetch:** `useEffect([search, page])` woła API z parametrami `search`, `page`, `limit`
- **Paginacja:** Prev/Next (wyłączone na granicach) + wskaźnik „Strona X z Y"
- **Układ:** responsywna **siatka** (`grid grid-cols-1 sm:grid-cols-2 …`) zamiast
  kolumny flex (punkt: wygląd)
- **Delete:** po usunięciu **refetch bieżącej strony** (uzupełnienie z następnej —
  inaczej na stronie zostanie 19 kart)
- **Edit:** `onSuccess` dalej podmienia element w bieżącej liście (`map`, funkcyjny updater)

### Empty states

- „Brak produktów" — gdy katalog pusty (`total === 0` i brak frazy)
- „Brak wyników dla frazy …" — gdy `total === 0` przy aktywnym `search`

## Obsługa błędów

- Toast `error` przy nieudanym fetchu (wzorzec już istnieje w `AllProducts`/`onDelete`)

## Testy

- **Backend (Vitest + Supertest):** rozszerzyć `product.test.ts`:
  - `?search=` zwraca przefiltrowane produkty
  - `?page=&limit=` zwraca właściwą porcję + poprawny `total`
  - walidacja capa `limit` (np. `limit=99999` → przycięte do 100, zwraca max 100 pozycji)
- **Frontend:** brak infrastruktury testowej → weryfikacja ręczna w przeglądarce
