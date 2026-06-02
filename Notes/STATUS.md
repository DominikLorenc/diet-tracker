# Diet Tracker — Status projektu

> Jedyne źródło prawdy o stanie projektu. Zweryfikowane z kodem 2026-06-02.
> Zasada: nie odhaczamy w wielu plikach — aktualizujemy TYLKO ten.

---

## ✅ Backend — kompletny

- **Auth:** register, login, JWT w httpOnly cookie, middleware ochrony tras
- **Products:** CRUD, wyszukiwanie, integracja Open Food Facts (cache-aside), `imageUrl`, `barcode`
- **Diary:** GET/POST/DELETE wpisów, flaga `isEaten` (eaten-toggle)
- **Recipes:** pełny CRUD + przepisy użytkownika (`userRecipe`, cascade delete)
- **User:** `GET /users/me`, `PATCH /users/goals`, tabela `userGoals`
- **Body measurements:** model + endpointy (strona progress z tego korzysta)
- **Favorites:** ulubione produkty
- **Recent searches:** service + controller + routes
- **Testy integracyjne:** auth, diary, product, recipe, user (Vitest + Supertest)

## ✅ Frontend — zrobione (zweryfikowane w kodzie)


| Ekran / funkcja                | Stan         | Uwaga                                                                                       |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------- |
| `/login`, `/register`          | ✅            | RHF + Zod                                                                                   |
| `/dashboard`                   | ✅            | DiaryDayView, DateNavigator, MacroSummary                                                   |
| `/dashboard/add`               | ✅            | dodawanie wpisu, ProductSearch, RecipeSearch                                                |
| `/dashboard/products`          | ✅            | lista + ProductForm                                                                         |
| `/dashboard/recipe-builder`    | ✅            | kreator przepisów                                                                           |
| `/dashboard/recipes`           | ✅            | lista przepisów                                                                             |
| `**/dashboard/profile`**       | ✅ **DZIAŁA** | GET `/users/me` + zapis celów przez `MacroCalculator` (PATCH `/users/goals`, Auto + Manual) |
| `**/dashboard/progress`**      | ✅            | pełny ekran: wykresy (recharts), pomiary ciała, modal, tabela historii, ~10 wywołań API     |
| `**/dashboard/shopping-list**` | ✅            | lista zakupów z planera, ~4 wywołania API                                                   |
| **Barcode scanner**            | ✅ kod gotowy | ⚠️ na gałęzi `feat/barcode-scanner`, **niezmergowany do main**                              |
| Toast notifications            | ✅            | `useToastStore` (Zustand) + `<Toast>`                                                       |
| Empty states                   | ✅ częściowo  | obecne w 8 miejscach (search, shopping-list, recipe-builder, barcode…)                      |
| Shared UI                      | ✅ częściowo  | istnieją `Button`, `Card`, `SectionHeader`, `Spinner`                                       |


> **Sprostowanie do starego `todo.md`:** twierdził, że profil „nie jest podpięty do API" i że trzeba zrobić od zera komponenty Button/Card — **oba nieprawdziwe**. Profil działa end-to-end, Button i Card istnieją.

---

## ⏳ Do zrobienia (potwierdzony brak w kodzie)

### Domknięcie bieżącej pracy

- **Zmergować `feat/barcode-scanner` do `main`** — gotowa praca leży niezmergowana (3 commity)

### Frontend — drobne braki

- **Quick Stats w profilu** — wartości zahardkodowane (1400 kcal, 7 streak, 142 meals, 3.2 kg). Podpiąć pod realne dane.
- `**/dashboard/all`** — to 10-liniowy stub (0 wywołań API). Dokończyć albo usunąć.
- **Shared `Input`** — Button/Card są, brakuje wspólnego `Input`
- **Loading skeletony** — dziś tylko teksty „Ładowanie…". Brak komponentów skeleton.

### Faza 3 — Testy + Zustand

- `**useAuthStore`** — istnieje tylko `useToastStore`
- **Testy frontend** — 0 plików testowych, brak `vitest.config`, brak `@testing-library` w deps
- **E2E Playwright** — brak `playwright.config`

### Faza 4 — Deployment

- Backend → Railway
- Frontend → Vercel
- README.md

---

## 🛠️ Dług techniczny / ulepszenia (scalone z `improvements.md`)

Zweryfikowane 2026-06-02. Już zrobione (skreślone): ~~**F1**~~ useMeasurements działa,
~~**F2**~~ brak `.env` w gitcie, ~~**B7**~~ martwy `diaryExists` usunięty,
~~**F7**~~ `remotePatterns` zawężone do `*.supabase.co` + `images.openfoodfacts.org` (2026-06-02).

### Backend

- **B1 — Row-level authorization (diary)** 🔴 przed deployem. `diaryService`: dodać `userId` do `where` w `findFirst/update/delete`; `diaryController`: brać `req.userId`, nie z body
- **B2 — Row-level authorization (recipe)** 🔴 sprawdzać właściciela przed edycją/usunięciem
- **B3 — Usuń `console.log`** z produkcji (`productController` ~99, `diaryService` ~134/153) → logger (`pino`)
- **B4 — CORS z env** 🟠 *potwierdzone aktualne* — `app.ts` ma hardcoded `['http://localhost:3000','http://localhost:3001']` → `process.env.CORS_ORIGINS`
- **B5 — Transakcja przy update recipe** — owinąć `deleteMany`+`create` w `prisma.$transaction`
- **B6 — Walidacja XOR w diary schema** — `.refine()`: dokładnie jedno z `productId`/`recipeId`
- **B8 — Spójny klucz błędów** — ujednolicić `errors` vs `message` w kontrolerach
- **B9 — Walidacja JWT payload** — runtime check zamiast `as jwt.JwtPayload`

### Frontend

- **F3 — Kolory do CSS variables** — ~80+ hardcoded w `style`; `DiaryDayView`, `MacroSummary`, `Toast`
- **F4 — Usuń zduplikowane typy** (`User`, `UserGoals`) → `_types/`
- **F5 — Over-fetching `/users/me`** — `useUserStore` (Zustand) zamiast wielu `useEffect` (pokrywa się z `useAuthStore` wyżej)
- **F6 — Dokończ ProductSearch** *potwierdzone* — celowe `TODO(human)` w liniach 83 i 311 (ostatnie wyszukiwania + lokalny stan ulubionych)
- **F11 — Błąd typów blokujący `next build`** 🟠 `MeasurementChart.tsx:85` — `formatter` recharts dostaje `ValueType | undefined`, kod deklaruje `(value: number)`. Build kompiluje się OK, ale wywala na etapie TypeScript. Naprawić typ w `formatter`.
- **F8 — Modal a11y** — focus trap + `aria-modal`/`role="dialog"` w `Modal.tsx`
- **F9 — Lepsze błędy formularzy** — przekazywać wiadomość z API zamiast „Coś poszło nie tak"
- **F10 — Error boundary** — `error.tsx` w `/app/dashboard/`

---

## Sugerowana kolejność

1. **Merge barcode** — najpierw domknij gotową pracę
2. **B1 + B2 — row-level authorization** 🔴 security, koniecznie przed deployem
3. **Quick Stats + `/dashboard/all`** — usuń resztki placeholderów/stubów
4. `**useAuthStore` / `useUserStore**` (= F5) — porządkuje stan auth, kończy over-fetching
5. **Pierwsze testy frontend** (Vitest + RTL) — zacznij od jednego komponentu
6. **B3, B4, B5 + F2-check** — standard produkcyjny przed deployem
7. **Deploy** (Railway + Vercel + README) — żeby projekt żył publicznie
8. Reszta długu technicznego + skeletony + shared `Input` — w wolnym czasie

