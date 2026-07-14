# Diet Tracker — Status projektu

> Jedyne źródło prawdy o stanie projektu. Zweryfikowane z kodem 2026-06-03. Ostatnia aktualizacja: 2026-07-09.
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
| **Barcode scanner**            | ✅            | zmergowany do `main` (commit `d94c4cd`)                                                     |
| Toast notifications            | ✅            | `useToastStore` (Zustand) + `<Toast>`                                                       |
| Empty states                   | ✅ częściowo  | obecne w 8 miejscach (search, shopping-list, recipe-builder, barcode…)                      |
| Shared UI                      | ✅ częściowo  | istnieją `Button`, `Card`, `SectionHeader`, `Spinner`                                       |


> **Sprostowanie do starego `todo.md`:** twierdził, że profil „nie jest podpięty do API" i że trzeba zrobić od zera komponenty Button/Card — **oba nieprawdziwe**. Profil działa end-to-end, Button i Card istnieją.

---

## ⏳ Do zrobienia (potwierdzony brak w kodzie)

### Frontend — drobne braki

- **Quick Stats w profilu** — 🔮 **feature na przyszłość, nie teraz**. Wartości zahardkodowane (1400 kcal, 7 streak, 142 meals, 3.2 kg). Podpiąć pod realne dane gdy będzie priorytet.
- ~~`**/dashboard/all`**~~ ✅ ZROBIONE (2026-06-03) — NIE był stubem, to działająca lista wszystkich produktów (`AllProducts`): GET `/products`, edycja przez modal z odświeżeniem listy, usuwanie, stan ładowania (`Spinner`), empty state, obsługa błędu `GET`.
- **Shared `Input`** — Button/Card są, brakuje wspólnego `Input`
- **Loading skeletony** — dziś tylko teksty „Ładowanie…". Brak komponentów skeleton.

### Faza 3 — Testy + Zustand

- ~~`**useUserStore`**~~ ✅ ZROBIONE (2026-07-03) — `store/useUserStore.ts` (Zustand, wzorzec jak `useToastStore`): `user`, `isLoading`, `fetchUser` (guard `user!==null` + `try/catch/finally`), `setUser`, `setUserGoals` (merge celów), `clearUser`. Napełniany raz w `dashboard/layout.tsx`. (Świadomie **nie** „auth store" — token żyje w httpOnly cookie, o dostępie decyduje middleware; store trzyma tylko dane usera. Patrz spec `docs/superpowers/specs/2026-07-03-user-store-design.md`.)
- **Testy frontend** — 0 plików testowych, brak `vitest.config`, brak `@testing-library` w deps
- **E2E Playwright** — brak `playwright.config`

### Faza 4 — Deployment

- ~~**Backend → Railway**~~ ✅ ZROBIONE (2026-07-09) — **poszło na Render** (nie Railway: Railway free to trial, Render ma darmowy tier na stałe; apka głównie dla 2 osób, cold start ~30-50s akceptowalny). Free web service, region Frankfurt (blisko bazy w eu-west-1). Root Directory `backend`. **Build Command:** `npm install --include=dev && npx prisma generate && npm run build` (`--include=dev` bo `NODE_ENV=production` pomija devDeps → bez tego `tsc`/`prisma` się nie instalują). **Env:** `DATABASE_URL` (Supabase session pooler), `JWT_SECRET` (openssl rand), `NODE_ENV=production`, `CORS_ORIGINS` (już nieużywane — patrz proxy niżej), `HUSKY=0` (żeby `prepare` nie wywalił builda).
- ~~**Baza produkcyjna**~~ ✅ ZROBIONE (2026-07-09) — **Postgres w istniejącym projekcie Supabase** (`diest-tracker`, plan FREE). Uwaga: dev nadal na `localhost`, prod na Supabase. Connection string: **Session pooler** (port 5432, `pooler.supabase.com`, IPv4) — NIE direct (IPv6, Render nie dogada) ani transaction pooler (psuje migracje). 15 migracji zaaplikowanych przez `prisma migrate deploy` z lokalu.
- ~~**Frontend → Vercel**~~ ✅ ZROBIONE (2026-07-09) — Root Directory `frontend`, **Framework Preset = Next.js** (nie „Services" — ten multi-serwisowy preset chciał deployować też backend i wywalał build na „No Output Directory public"). Env: `NEXT_PUBLIC_API_URL=/api/v1` (relatywny!), `NEXT_PUBLIC_SUPABASE_*`.
- ~~**Cross-domain cookie**~~ ✅ ROZWIĄZANE (2026-07-09) — **kluczowy problem deploya.** Backend (Render) i frontend (Vercel) to różne domeny → cookie ustawiane przez backend ląduje w słoiku `onrender.com`, a `proxy.ts` (route protection) na `vercel.app` go nie widzi → wieczny redirect na `/login`. Rozwiązanie: **Next.js rewrite** w `next.config.ts` (`/api/v1/:path*` → `https://diet-tracker-fprp.onrender.com/api/v1/:path*`) + `NEXT_PUBLIC_API_URL=/api/v1`. Przeglądarka gada tylko z vercel.app, Vercel proxuje server-side do Render, cookie ustawia się **first-party** do vercel.app → `proxy.ts` je czyta, znika też problem third-party cookie (Safari). Backend: `sameSite: NODE_ENV==='production' ? 'none' : 'strict'` + `secure` zależny od env. **Pułapka która zjadła najwięcej czasu:** zmiana `NEXT_PUBLIC_API_URL` wymaga **redeploy bez cache** — `NEXT_PUBLIC_*` jest wkompilowane przy buildzie, stara wartość (onrender.com) siedziała w bundlu mimo zmiany env.
- ~~**Bezpieczeństwo bazy (Supabase RLS)**~~ ✅ ZROBIONE (2026-07-09) — Advisor krzyczał „RLS Disabled" (15×). Tabele robione migracjami Prismy → domyślne uprawnienia Supabase dają roli `anon` dostęp, a klucz anon jest publiczny (frontend) → Data API (PostgREST) było „drugimi drzwiami" do bazy omijającymi Express. **Fix:** wyłączony **Data API** (Settings → API → Enable Data API OFF) — nie używamy PostgREST, dane idą przez Express. Storage (obrazki) nietknięty, bo to osobna usługa.
- ~~**README.md**~~ ✅ ZROBIONE (2026-07-10) — root `README.md` zaktualizowany: live URL-e, feature „Recipes", sekcja architektury o cross-domain cookie (rewrite proxy), poprawiona struktura frontendu (`app/`, `store/`, `schemas/` w rootcie, nie pod `src/`), sekcja Deployment.

**Live URL-e:**
- Frontend: `https://diet-tracker-lime.vercel.app`
- Backend: `https://diet-tracker-fprp.onrender.com` (health: `/health`)

**Dług z deploya (do posprzątania):**
- ~~`frontend/next.config.ts` — URL backendu w rewrite **zahardkodowany**~~ ✅ ZROBIONE (2026-07-14) — `destination` czyta `process.env.BACKEND_URL` z fallbackiem na `http://localhost:4000` (rewrite lokalnie i tak uśpiony, więc localhost nieszkodliwy; `next dev`/`build` nie pada na `undefined`). Zmienna udokumentowana w `frontend/.env.example`. Na Vercel dodane `BACKEND_URL` (scope: **tylko Production** — jak użyjesz preview deployów, dodać też do Preview). Uwaga: to zmienna server-side (nie `NEXT_PUBLIC_`), więc zmiana wymaga **zwykłego** redeployu, nie „bez cache".
- Upload obrazków leci **kluczem anon (publicznym)** wprost do Supabase Storage → bucket zapisywalny przez każdego z kluczem. Prawdziwy fix: upload przez backend `service_role`. Niski priorytet (2 userów).
- `CORS_ORIGINS` na Render nieużywane (ruch Vercel→Render jest server-side) — można usunąć.
- ~~`vitest.config.ts` nie wyklucza `dist/` → `build` przed `test` daje widmowe faile~~ ✅ ZROBIONE (2026-07-14) — `exclude: ['**/dist/**', '**/node_modules/**']`. **Pułapka:** w vitest 4 domyślny `exclude` to TYLKO `node_modules` + `.git` (nie merge'uje — `exclude` **zastępuje** defaulty), więc trzeba było ręcznie dopisać `node_modules`, inaczej vitest zacząłby skanować zależności. Zweryfikowane: `build` (5 skompilowanych `*.test.js` w `dist/`) + `test` = dalej 72/72, kopie z `dist/` ignorowane. Alternatywa bardziej future-proof: `[...configDefaults.exclude, 'dist/**']`.
- Testowy user `rendertest@example.com` w prod bazie — do usunięcia (Table Editor).

---

## 🛠️ Dług techniczny / ulepszenia (scalone z `improvements.md`)

Zweryfikowane 2026-06-03. Już zrobione (skreślone): ~~**F1**~~ useMeasurements działa,
~~**F2**~~ brak `.env` w gitcie, ~~**B7**~~ martwy `diaryExists` usunięty,
~~**F7**~~ `remotePatterns` zawężone do `*.supabase.co` + `images.openfoodfacts.org` (2026-06-02),
~~**B1**~~ + ~~**B2**~~ access control — patrz niżej (2026-06-03).

### Backend

- ~~**B1 — Row-level authorization (diary)**~~ ✅ ZROBIONE. `diaryService` filtruje `userId` w `where` (`delete`/`update`/`deleteItem`), kontrolery biorą `req.userId`.
- ~~**B2 — Row-level authorization (recipe)**~~ ✅ ZROBIONE — z rozróżnieniem na dwa modele: `Recipe` (globalny katalog, **bez właściciela**) chroniony przez `requireAdmin` na trasach `POST/PATCH/DELETE` (= role-based, bo nie ma czego „posiadać"); `UserRecipe` (przepis usera) filtruje `where: { id, userId }` w `update`/`delete`. Wniosek: A01 to nie zawsze `userId` w `where` — dla zasobu współdzielonego właściwa jest kontrola ról.
- **B3 — Usuń `console.log`** z produkcji (`productController` ~99, `diaryService` ~134/153) → logger (`pino`)
- ~~**B4 — CORS z env**~~ ✅ ZROBIONE (2026-06-12) — `app.ts` czyta `process.env.CORS_ORIGINS` (CSV → `split(',').map(trim)`) z fallbackiem na localhost; udokumentowane w `.env.example`.
- ~~**B5 — Transakcja przy update recipe**~~ ✅ ZBADANE + DOMKNIĘTE (2026-07-03). Pierwotne założenie było **błędne**: `deleteMany`+`create` to *nested write* w jednym `prisma.update`, więc Prisma już owija je w transakcję (atomowe). Unikalność nazwy też już chroniona na poziomie bazy: `Recipe.name @unique` + `UserRecipe @@unique([userId, name])` — czyli wyścig TOCTOU na `recipeExists` łapie baza (`P2002`), nie 500. Realna (kosmetyczna) poprawka: `try/catch` na `update` w `recipeService.updateRecipeValues` i `userRecipeService.updateUserRecipe` mapujący `P2002` → `AppError(409)`. +test integracyjny „PATCH recipes → 409" (uwaga: mockuje serwis, więc sprawdza mapowanie w kontrolerze, nie samo tłumaczenie P2002). Przy okazji naprawiony token testowy w `recipa.test.ts` (dodane `role: 'ADMIN'`) — odblokował 8 testów `POST/PATCH/DELETE`, które padały na `requireAdmin` (403) od czasu B2. **Lekcja:** nie ufaj notatce TODO — zweryfikuj co ORM i baza już gwarantują.
- ~~**B6 — Walidacja XOR w diary schema**~~ ✅ ZROBIONE (2026-06-12) — `.refine()` na `diaryEntrySchema`: dokładnie jedno z `productId`/`recipeId`/`userRecipeId` (suma `Number(Boolean(...))` === 1). +2 testy integracyjne (zero źródeł → 400, wiele źródeł → 400); poprawiony błędny test, który asercjował dwa źródła naraz.
- **B8 — Spójny klucz błędów** — ujednolicić `errors` vs `message` w kontrolerach
- **B9 — Walidacja JWT payload** — runtime check zamiast `as jwt.JwtPayload`
- **B11 — Serwis zwraca więcej niż deklaruje kontrakt** (odkryte 2026-07-03 przy F5/B2) — `updateGoalsService` zwraca **całego `User`** (`User & { userGoals }`), a dok OpenAPI (`userDocs.ts:141`) i wygenerowany typ we froncie deklarują `updated` jako **sam `UserGoals`**. Runtime rozjechał się z kontraktem → frontendowy `setUserGoals(data.updated)` dostawał usera zamiast celów i wpychał go w slot `userGoals` → UI pokazywał zera do czasu refreshu. **Doraźnie naprawione** (2026-07-03): kontroler `updateGoals` odsyła `updated.userGoals` (runtime = kontrakt). **Zostaje jako dług:** (a) serwis nadal over-zwraca całego usera — zawęzić `Promise<UserGoal>` albo `select` tylko celów; (b) niespójna konwencja odpowiedzi mutacji: PATCH goals zwraca `updated` (cele), a GET `/users/me` zwraca `user` (pełny) — rozważyć standard „mutacja zwraca zaktualizowany zasób" spójnie w całym API (pokrewne B8). **Lekcja:** `tsc` był zielony, bo typ z `schema.d.ts` (z doka) kłamał — wygenerowany typ jest tak dobry jak dok, z którego powstał; nie zastępuje weryfikacji runtime.
- ~~**B10 — Mocki testowe rozjechane ze schematem**~~ ✅ ZROBIONE (2026-07-03) — weryfikacja `tsc --noEmit` pokazała, że notatka była już nieaktualna: błędy z `recipa.test.ts` zniknęły (mock dostał `imageUrl`/`barcode`), a mocki w `user.test.ts` mają już zagnieżdżoną strukturę `userGoals` (nie płaskie `dailyCaloriesGoal`). Stan końcowy: `tsc --noEmit` = 0 błędów, `npm test` = 72/72. **Lekcja (ta sama co B5):** nie ufaj notatce TODO — odpal `tsc --noEmit`, żeby zweryfikować realny stan. Cichy dług brał się stąd, że Vitest odpala testy przez esbuild (goły JS, zero typecheckingu), więc niezgodność typu przechodziła aż do `next build`/CI.
- **B12 — `clearCookie` bez opcji przy logout** (odkryte 2026-07-09 przy audycie pre-deploy) — `logout` w `userController.ts:58` robi `res.clearCookie('token')` bez opcji, podczas gdy `login` ustawia cookie z `sameSite`/`secure`/`httpOnly`. Kasowanie działa (dopasowanie po nazwie+domenie+path, a te się zgadzają — path domyślnie `/`), więc **to nie bug**, tylko kosmetyka. Best practice: przekazać te same atrybuty przy kasowaniu (`sameSite`/`secure` zależne od `NODE_ENV` jak w `login`), żeby nigdy się nie rozjechały. Rozważyć wspólny helper na opcje cookie, żeby login i logout czytały z jednego źródła.

### Frontend

- ~~**F3 — Kolory do CSS variables**~~ ✅ ZROBIONE (2026-06-03) — ~120+ hardcoded hex zastąpionych CSS variables. Nowe zmienne w `globals.css` (`@theme inline`): surfaces (`dash-surface-darker`, `dash-card-unselected`, `dash-icon-bg`, `dash-badge-bg`), navigation, SVG, chart, forms, gradients (`gradient-green-logo`, `gradient-green-button`, `gradient-cta`, `gradient-calories`), shadows. Objęte: `DiaryDayView`, `MacroSummary`, `Toast`, `Navbar`, `dashboard/layout`, `login/page`, `register/page`, `page.tsx`, `DateNavigator`, auth forms, wszystkie komponenty `add/`, `barcode/`, `progress/`, `shared/ProductForm`, `MacroCalculator`.
- ~~**F4 — Usuń zduplikowane typy** (`User`, `UserGoals`)~~ ✅ ZROBIONE (2026-07-03) — jeden wspólny typ w `app/_types/user.ts`, importowany przez store i konsumentów; skasowane 4 lokalne duplikaty (`profile`, `MacroSummary`, `DiaryDayView`, martwy `UserInfo`).
- ~~**F5 — Over-fetching `/users/me`**~~ ✅ ZROBIONE (2026-07-03) — 6 niezależnych fetchy zredukowanych do **1** (pobranie raz w layoutcie, reszta czyta ze store'a). Zmigrowani konsumenci: `MacroSummary`, `DiaryDayView`, `recipe-builder`, `recipes`, `profile`. Po zapisie celów store aktualizowany z odpowiedzi PATCH (B2) zamiast `window.location.reload()`. Przy okazji: usunięty martwy `UserInfo`+`SetGoalsForm`, `clearUser` przy logout, naprawiony bug B11 (kontrakt/runtime), `isAdmin` w `recipes` zmienione ze stanu na wartość pochodną.
- **F6 — Dokończ ProductSearch** *potwierdzone* — celowe `TODO(human)` w liniach 83 i 311 (ostatnie wyszukiwania + lokalny stan ulubionych)
- ~~**F11 — Błąd typów blokujący `next build`**~~ ✅ ZROBIONE (2026-06-12) — `MeasurementChart.tsx` `formatter`: usunięto błędną adnotację `(value: number)`, TS wnioskuje `ValueType` z propsa recharts. Cały frontend `tsc --noEmit` = 0 błędów.
- **F8 — Modal a11y** — focus trap + `aria-modal`/`role="dialog"` w `Modal.tsx`
- **F9 — Lepsze błędy formularzy** — przekazywać wiadomość z API zamiast „Coś poszło nie tak"
- ~~**F10 — Error boundary**~~ ✅ ZROBIONE (2026-06-12) — `app/dashboard/error.tsx` (Client Component, propsy `{ error, reset }`), `console.error` w `useEffect`, przycisk `reset` (Wasz `Button` outline), ostylowane pod design system (`form-error`, `dash-fg-muted`).

---

## Sugerowana kolejność

1. ~~**Merge barcode**~~ ✅ zmergowany do `main`
2. ~~**B1 + B2 — row-level authorization**~~ ✅ zrobione (patrz dług techniczny → Backend)
3. ~~**`/dashboard/all`**~~ ✅ zrobione (patrz „Frontend — drobne braki")
4. ~~**Przeglądanie listy produktów**~~ ✅ zrobione (2026-06-12) — server-side search + paginacja w `GET /products` (Zod query: `page`/`limit`/`search`, cap `limit` do 100, `$transaction` na findMany+count), `AllProducts` z debounce + paginacją, 6 testów kontrolera (`toHaveBeenCalledWith`, cap, walidacja 400). Spec: `docs/superpowers/specs/2026-06-03-products-list-browsing-design.md`
5. ~~`**useUserStore**` (= F5/F4)~~ ✅ zrobione (2026-07-03) — patrz „Faza 3" i dług F4/F5
6. **Pierwsze testy frontend** (Vitest + RTL) — zacznij od jednego komponentu
7. **B3, B4, B5 + F2-check** — standard produkcyjny przed deployem
8. ~~**Deploy**~~ ✅ ZROBIONE (2026-07-09) — **Render (backend) + Vercel (frontend) + Supabase (baza)**. Apka live end-to-end. Szczegóły + pułapki: patrz „Faza 4 — Deployment".
9. Reszta długu technicznego + skeletony + shared `Input` — w wolnym czasie
10. **Quick Stats w profilu** (feature na przyszłość) — podpiąć zahardkodowane wartości pod realne dane

