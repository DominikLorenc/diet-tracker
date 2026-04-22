# Diet Tracker — Improvements

## BACKEND

### 🔴 Krytyczne

#### B1 — Row-level authorization (diary)
Każda operacja na diary musi weryfikować, że `req.userId` === `userId` właściciela wpisu.
- [ ] `diaryService.ts` — dodaj `userId` do warunków `where` w `findFirst`, `update`, `delete`
- [ ] `diaryController.ts` — przekazuj `req.userId` do wszystkich serwisów zamiast brać z body

#### B2 — Row-level authorization (recipe)
- [ ] `recipeService.ts` — sprawdź czy przepis należy do `req.userId` przed edycją/usunięciem

---

### 🟠 Ważne

#### B3 — Usuń console.log z kodu produkcyjnego
- [ ] `productController.ts` linia ~99
- [ ] `diaryService.ts` linie ~134 i ~153
- [ ] Zastąp właściwym loggerem (np. `pino`) lub po prostu usuń

#### B4 — CORS z env vars
- [ ] `app.ts` — zamień hardcoded `['http://localhost:3000', ...]` na `process.env.CORS_ORIGINS`
- [ ] Dodaj `CORS_ORIGINS` do `.env` i dokumentacji

#### B5 — Transakcja przy update recipe
Jeśli `deleteMany` przejdzie a `create` się wywróci, tracisz dane.
- [ ] `recipeService.ts` — owiń `deleteMany` + `create` w `prisma.$transaction`

#### B6 — Walidacja XOR w diary schema
Wpis musi mieć `productId` LUB `recipeId`, nie oba i nie żadne.
- [ ] `diarySchema.ts` — dodaj `.refine()` sprawdzające że dokładnie jedno z dwóch jest podane

#### B7 — Usuń martwy kod
- [ ] `diaryService.ts` — usuń zakomentowaną funkcję `diaryExists` (linie 5–12)

---

### 🟡 Drobne

#### B8 — Spójne odpowiedzi błędów
- [ ] `productController.ts` używa klucza `errors`, `userController.ts` używa `message`
- [ ] Ujednolicić do jednego klucza (np. `message`) we wszystkich kontrolerach

#### B9 — Walidacja JWT payload
- [ ] `authMiddleware.ts` — zamiast `as jwt.JwtPayload` dodaj runtime check że `payload.userId` istnieje i jest stringiem

---

## FRONTEND

### 🔴 Krytyczne

#### F1 — Napraw useMeasurements hook
Strona Progress nie działa — hook to pusty stub.
- [ ] `_hooks/useMeasurements.ts` — zaimplementuj fetching z `/measurements` endpointu
- [ ] Podłącz do komponentów na stronie `/dashboard/progress`

#### F2 — Usuń credentials z repozytorium
- [ ] Sprawdź czy `.env.local` jest w `.gitignore`
- [ ] Jeśli był kiedykolwiek commitowany — zrotuj klucze Supabase

---

### 🟠 Ważne

#### F3 — Przenieś kolory do CSS variables
Aktualnie ~80+ hardcoded wartości kolorów w `style` props.
- [ ] `globals.css` — zdefiniuj brakujące zmienne (np. `--color-text-muted: #8FA0B8`)
- [ ] `DiaryDayView.tsx` — zamień inline `style={{ color: "..." }}` na `className`
- [ ] `MacroSummary.tsx` — to samo
- [ ] `Toast.tsx` — przenieś kolory z hardcoded obiektu do CSS/Tailwind klas

#### F4 — Usuń zduplikowane typy
Te same typy (`User`, `UserGoals`) są definiowane w wielu komponentach.
- [ ] Przenieś do `_types/` (np. `_types/user.ts`, `_types/diary.ts`)
- [ ] Zaimportuj zamiast redefiniować w `DiaryDayView.tsx` i `MacroSummary.tsx`

#### F5 — Ogranicz over-fetching `/users/me`
Endpoint jest wywoływany niezależnie w kilku komponentach naraz.
- [ ] Dodaj Zustand store `useUserStore` z `user` i `fetchUser()`
- [ ] Komponenty czytają ze store zamiast robić własny `useEffect` + fetch

#### F6 — Dokończ ProductSearch
- [ ] `ProductSearch.tsx` linia ~75 — zaimplementuj lub usuń TODO o ostatnich wyszukiwaniach

---

### 🟡 Drobne

#### F7 — Zawęź remote image pattern
- [ ] `next.config.ts` — zamień `hostname: "**"` na konkretne domeny (Supabase bucket URL)

#### F8 — Modal accessibility
- [ ] `Modal.tsx` — dodaj focus trap (np. biblioteka `focus-trap-react` lub ręczna logika)
- [ ] Dodaj `aria-modal="true"` i `role="dialog"`

#### F9 — Lepsza obsługa błędów w formularzach
- [ ] Zamiast generycznego `"Coś poszło nie tak"` przekazuj wiadomość z API jeśli dostępna
- [ ] `ProductForm.tsx`, `LoginForm.tsx` — sprawdź response body przed ustawieniem fallback errora

#### F10 — Error boundary
- [ ] Dodaj `error.tsx` w `/app/dashboard/` — jeden crash komponentu nie powinien niszczyć całej strony

---

## Kolejność roboty

1. B1, B2 — security, przed jakimkolwiek deploy
2. F1 — żeby Progress działał
3. F2 — credentials
4. B3, B4, B5 — produkcyjny standard
5. F3, F4, F5 — maintainability
6. Reszta w wolnym czasie
