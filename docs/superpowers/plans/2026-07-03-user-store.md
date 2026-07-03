# useUserStore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jedno współdzielone źródło danych zalogowanego usera (Zustand), zamiast 6 niezależnych fetchy `/users/me`.

**Architecture:** Store `useUserStore` (wzorzec jak `useToastStore`, bez middleware) napełniany raz w `dashboard/layout.tsx` (guard `user !== null`). Konsumenci czytają ze store'a. Po `PATCH /users/goals` store aktualizowany z odpowiedzi (B2). `clearUser()` przy logout. Typ `User` skonsolidowany w `app/_types/user.ts`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Zustand 5, `apiClient` (openapi-fetch).

**Spec:** `docs/superpowers/specs/2026-07-03-user-store-design.md`

## Global Constraints

- TypeScript zawsze, **nigdy `any`** (CLAUDE.md).
- Nazwy zmiennych/funkcji po angielsku; komentarze po polsku gdy coś wymaga wyjaśnienia.
- Store bez middleware (persist/devtools) — trzymamy wzorzec `store/useToastStore.ts`.
- **Commity robi użytkownik.** Kroki „Commit" to sygnał „tu jest dobry moment na commit" — NIE uruchamiaj `git commit` sam; zatrzymaj się i pozwól userowi zacommitować.
- Brak harnessu testowego na froncie → weryfikacja **ręczna** (dev server + Network). Setup Vitest/RTL jest poza zakresem (krok 6 w STATUS).
- Po każdej zmianie kodu: `npm run build`-owy typecheck przez `npx tsc --noEmit` w `frontend/` musi przechodzić (0 błędów).

---

### Task 1: Wspólny typ `User` (zamyka F4)

**Files:**
- Create: `frontend/app/_types/user.ts`

**Interfaces:**
- Produces: `export type User`, `export type UserGoals` — importowane przez store (Task 2) i wszystkich konsumentów (Task 4–5).

- [ ] **Step 1: Utwórz plik typu**

To boilerplate (kształt 1:1 z istniejących duplikatów) — pełny kod:

```ts
// frontend/app/_types/user.ts
export type UserGoals = {
  id: string;
  dailyCaloriesGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbsGoal: number | null;
  dailyFatGoal: number | null;
};

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userGoals: UserGoals | null;
};
```

- [ ] **Step 2: Zweryfikuj zgodność z kontraktem API**

Otwórz `frontend/src/lib/api/schema.d.ts`, znajdź response `"/users/me"` (`get`) i porównaj pola z powyższym typem. Jeśli coś się różni — **prawdą jest kontrakt OpenAPI**, dostosuj typ do niego. (To celowa weryfikacja ze specu.)

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 błędów (nowy plik nie jest jeszcze importowany, ale nie może mieć błędów składniowych).

- [ ] **Step 4: Commit** *(user commituje)*

Sugerowana wiadomość: `refactor(types): shared User/UserGoals type in _types/user.ts (F4)`

---

### Task 2: Store `useUserStore`

**Files:**
- Create: `frontend/store/useUserStore.ts`

**Interfaces:**
- Consumes: `User` z `app/_types/user.ts`; `apiClient` z `app/lib/apiClient`.
- Produces:
  - `useUserStore` (hook Zustand) ze stanem:
    - `user: User | null`
    - `isLoading: boolean`
    - `fetchUser: () => Promise<void>`
    - `setUser: (user: User) => void`
    - `clearUser: () => void`

- [ ] **Step 1: Szkielet store'a (boilerplate)**

Utwórz plik z całą strukturą OPRÓCZ ciała `fetchUser`:

```ts
// frontend/store/useUserStore.ts
import { create } from "zustand";
import { apiClient } from "@/app/lib/apiClient";
import type { User } from "@/app/_types/user";

interface UserState {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  fetchUser: async () => {
    // TODO(human)
  },
}));
```

- [ ] **Step 2: `TODO(human)` — napisz ciało `fetchUser`**

To jest fragment do samodzielnego napisania (nauka Zustanda + async). Wymagania:

1. **Guard:** jeśli `get().user !== null` → `return` (nie pobieraj ponownie; to serce oszczędności — klik między stronami nie odpala requestu).
2. Ustaw `isLoading: true`.
3. Pobierz: `const { data, error } = await apiClient.GET("/users/me");`
4. Sukces (`data?.user`) → `set({ user: data.user })` (użyj akcji/`set`).
5. Błąd → zaloguj (`console.error`), zostaw `user` na `null`.
6. Na końcu (sukces czy błąd) → `isLoading: false`.

Wskazówka: w akcjach Zustanda masz `set` i `get` z argumentów `create`. `set` przyjmuje częściowy obiekt stanu i go scala. Nie przekierowuj przy błędzie — tym zajmuje się middleware/apiClient.

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 błędów. (Jeśli `data.user` ma typ niezgodny z `User` — to sygnał z Task 1 Step 2: dostosuj typ do kontraktu.)

- [ ] **Step 4: Commit** *(user commituje)*

Sugerowana wiadomość: `feat(store): add useUserStore for shared /users/me data`

---

### Task 3: Napełnienie store'a w layout dashboardu

**Files:**
- Modify: `frontend/app/dashboard/layout.tsx` (dodać import + `useEffect`)

**Interfaces:**
- Consumes: `useUserStore.fetchUser` (Task 2).

- [ ] **Step 1: Dodaj wywołanie `fetchUser` przy montowaniu layoutu**

W `frontend/app/dashboard/layout.tsx`:
- Dodaj importy na górze: `import { useEffect } from "react";` (dopisz do istniejącego importu React jeśli jest) oraz `import { useUserStore } from "@/store/useUserStore";`
- W komponencie `DashboardLayout`, obok istniejących hooków (`usePathname`, `useRouter`), dodaj:

```ts
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    // Jedyny punkt pobrania usera. Renderuje się przy każdym wejściu
    // w /dashboard/* (także po F5), guard w store chroni przed powtórnym fetchem.
    fetchUser();
  }, [fetchUser]);
```

- [ ] **Step 2: Weryfikacja ręczna — jeden request**

Run: `cd frontend && npm run dev`
- Zaloguj się, wejdź na `/dashboard`.
- DevTools → Network → filtr `me`.
Expected: **dokładnie 1×** `GET /users/me` przy wejściu na dashboard (wcześniej pojawiał się wielokrotnie). Klikanie po zakładkach nie dokłada kolejnych.

- [ ] **Step 3: Typecheck + Commit** *(user commituje)*

Run: `cd frontend && npx tsc --noEmit` → 0 błędów.
Sugerowana wiadomość: `feat(dashboard): populate user store once in layout`

---

### Task 4: Migracja konsumentów tylko-do-odczytu

Cztery komponenty czytają usera i mają zduplikowany typ. Zamieniamy self-fetch na odczyt ze store'a i usuwamy lokalny typ.

**Files:**
- Modify: `frontend/app/_components/dashboard/MacroSummary.tsx`
- Modify: `frontend/app/_components/dashboard/DiaryDayView.tsx`
- Modify: `frontend/app/dashboard/recipe-builder/page.tsx`
- Modify: `frontend/app/dashboard/recipes/page.tsx`

**Interfaces:**
- Consumes: `useUserStore` (Task 2), `User` (Task 1).

- [ ] **Step 1: Wzorzec migracji (na przykładzie `MacroSummary.tsx`)**

Zastąp lokalny stan/fetch odczytem ze store'a. Konkretnie w `MacroSummary.tsx`:
- Usuń lokalne `type UserGoals` i `type User` (linie 7–24).
- Usuń `useState`/`useEffect` fetchujące usera (linie 82–92) oraz prop `user?: User | null` jeśli parent przestanie go podawać (patrz DiaryDayView niżej).
- Dodaj: `import { useUserStore } from "@/store/useUserStore";` i (jeśli typ potrzebny) `import type { User } from "@/app/_types/user";`
- Zamiast wyliczania `const user = userProp !== undefined ? userProp : fetchedUser;` użyj:

```ts
  const user = useUserStore((s) => s.user);
```

- [ ] **Step 2: `TODO(human)` — zastosuj ten sam wzorzec do pozostałych 3 plików**

Dla każdego z: `DiaryDayView.tsx`, `recipe-builder/page.tsx`, `recipes/page.tsx`:
1. Znajdź lokalny `useEffect` z `apiClient.GET("/users/me")` i towarzyszący `useState`.
2. Usuń je; usuń lokalny `type User`/`UserGoals` jeśli jest.
3. Wstaw `const user = useUserStore((s) => s.user);`.
4. **Uwaga na `DiaryDayView`:** dziś fetchuje usera i przekazuje go propem do `MacroSummary`. Skoro `MacroSummary` czyta teraz ze store'a — usuń przekazywanie propa `user` (i sam prop w `MacroSummary`, jeśli nikt inny go nie podaje). Zweryfikuj grepem: `grep -rn "MacroSummary" frontend/app`.

Wskazówka: `getItemMacros`/`DiaryItem` w `MacroSummary` importowane z `DiaryDayView` — tego nie ruszaj, to niezwiązane.

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 błędów. Jeśli TS krzyczy o usuniętym propie `user` — to prowadzi Cię do miejsc, które trzeba dokończyć (to dobre, nie zły znak).

- [ ] **Step 4: Weryfikacja ręczna**

Dev server: wejdź na `/dashboard` i `/dashboard/recipes` — dane usera (cele, makra) wyświetlają się jak wcześniej. Network: dalej 1× `/users/me`.

- [ ] **Step 5: Commit** *(user commituje)*

Sugerowana wiadomość: `refactor: read user from store in read-only consumers (F5)`

---

### Task 5: Profil — odczyt ze store'a + aktualizacja B2 po zapisie celów

Najbardziej złożony task: profil czyta ze store'a, a po zapisie celów aktualizuje store danymi z odpowiedzi PATCH (zamiast `window.location.reload()`).

**Files:**
- Modify: `frontend/app/dashboard/profile/page.tsx`
- Modify: `frontend/app/_components/shared/MacroCalculator/index.tsx`
- Modify: `frontend/app/_components/shared/MacroCalculator/AutoForm.tsx`
- Modify: `frontend/app/_components/shared/MacroCalculator/ManualForm.tsx`

**Interfaces:**
- Consumes: `useUserStore` (`user`, `setUser`), `User` (Task 1).
- Produces (zmiana kontraktu): `MacroCalculator` / `AutoForm` / `ManualForm` prop `onSuccess?: (user: User) => void` (wcześniej bezargumentowy).

- [ ] **Step 1: Przenieś response z PATCH do góry — `ManualForm` i `AutoForm`**

W obu formularzach (`ManualForm.tsx` ~78, `AutoForm.tsx` ~55) zmień:
```ts
const { error } = await apiClient.PATCH("/users/goals", { ... });
```
na przechwycenie danych:
```ts
const { data, error } = await apiClient.PATCH("/users/goals", { ... });
```
oraz w gałęzi sukcesu:
```ts
} else {
  setSuccess(true);
  if (data?.user) onSuccess?.(data.user);
}
```
Zmień typ propa w obu plikach: `onSuccess?: (user: User) => void;` i dodaj `import type { User } from "@/app/_types/user";`. Zweryfikuj kształt `data.user` względem `schema.d.ts` dla `PATCH /users/goals`.

- [ ] **Step 2: Przekaż typ propa przez `MacroCalculator/index.tsx`**

W `index.tsx` (~12) zmień `onSuccess?: () => void;` na `onSuccess?: (user: User) => void;` i dodaj import `User`. Przekazywanie do `AutoForm`/`ManualForm` (`onSuccess={onSuccess}`) zostaje bez zmian.

- [ ] **Step 3: `TODO(human)` — przepisz `profile/page.tsx` na store**

Cel: profil bez własnego fetcha i bez `window.location.reload()`. Kroki do samodzielnego wykonania:
1. Usuń lokalne `type User`/`UserGoal` (linie 36–53) — importuj z `@/app/_types/user`.
2. Usuń `useState<User>` + `useEffect` fetchujący (linie 56–72). Zamiast tego:
   - `const user = useUserStore((s) => s.user);`
   - `const isLoading = useUserStore((s) => s.isLoading);`
   - `const setUser = useUserStore((s) => s.setUser);`
3. Zmień `<MacroCalculator onSuccess={() => window.location.reload()} />` na:
   `<MacroCalculator onSuccess={setUser} />`
   (to jest B2: świeży user z odpowiedzi PATCH → prosto do store'a, zero reloadu).
4. Zostaw istniejące gałęzie `isLoading`/`!user` — ale zauważ: teraz `user` może być `null` na pierwszym renderze zanim layout dociągnie dane. Rozważ warunek `if (!user) return <...ładowanie...>` zamiast polegać wyłącznie na `isLoading`.

Wskazówka: `error` state był lokalny dla fetcha profilu — po migracji fetch znika, więc lokalna obsługa `error` też. Błędy pobrania obsługuje store (log) + layout.

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 błędów. Niespójny podpis `onSuccess` w którymkolwiek pliku ujawni się tutaj.

- [ ] **Step 5: Weryfikacja ręczna — B2 bez reloadu**

Dev server → `/dashboard/profile`:
- Zmień cele w `MacroCalculator`, zapisz.
Expected: `MacroGoals` i inne miejsca (np. `MacroSummary` na dashboardzie) pokazują nowe wartości **bez** przeładowania strony. Network: przy zapisie leci **tylko** `PATCH /users/goals` (żadnego dodatkowego `GET /users/me`).

- [ ] **Step 6: Commit** *(user commituje)*

Sugerowana wiadomość: `feat(profile): update user store from PATCH response, drop full reload (B2)`

---

### Task 6: `clearUser()` przy logout

**Files:**
- Modify: `frontend/app/dashboard/layout.tsx` (handler `handleLogout`, ~28)
- Modify: `frontend/app/_components/shared/Navbar.tsx` (handler `handleLogout`, ~15)

**Interfaces:**
- Consumes: `useUserStore.clearUser` (Task 2).

- [ ] **Step 1: Wyczyść store po wylogowaniu — oba miejsca**

W obu plikach dodaj `import { useUserStore } from "@/store/useUserStore";`, w komponencie `const clearUser = useUserStore((s) => s.clearUser);`, i w handlerze:

```ts
  const handleLogout = async () => {
    await apiClient.DELETE("/users/logout");
    clearUser(); // wyczyść dane usera z pamięci, żeby po zalogowaniu innego usera nie mignął poprzedni
    router.push("/login");
  };
```

- [ ] **Step 2: Weryfikacja ręczna**

Dev server: zaloguj usera A → wyloguj → zaloguj usera B (jeśli masz dwa konta). Expected: brak mignięcia danych usera A. (Jeśli masz jedno konto — sprawdź przynajmniej, że po logout→login dane ładują się poprawnie.)

- [ ] **Step 3: Typecheck + Commit** *(user commituje)*

Run: `cd frontend && npx tsc --noEmit` → 0 błędów.
Sugerowana wiadomość: `feat(auth): clear user store on logout`

---

### Task 7: Martwy `UserInfo` — zweryfikuj i posprzątaj

`UserInfo.tsx` fetchuje `/users/me` i ma prop `refreshKey`, ale grep nie znalazł nigdzie `<UserInfo>`. Trzeba potwierdzić, że jest martwy, i zdecydować.

**Files:**
- Verify/Modify/Delete: `frontend/app/_components/auth/UserInfo.tsx`

- [ ] **Step 1: Potwierdź, że komponent jest nieużywany**

Run: `cd frontend && grep -rn "UserInfo" app`
Expected: trafienia tylko w samym `UserInfo.tsx` (definicja) → komponent martwy.

- [ ] **Step 2: `TODO(human)` — decyzja**

Jeśli potwierdzone martwy:
- **Opcja A (zalecana): usuń plik** `UserInfo.tsx` — martwy kod z własnym fetchem i zduplikowanym typem. Sprawdź, czy nie ciągnie za sobą `SetGoalsForm` (import w UserInfo) — jeśli `SetGoalsForm` też jest martwy, rozważ jego los osobno (nie rozszerzaj scope'u bez potrzeby).
- **Opcja B:** jeśli planujesz go wkrótce użyć — zmigruj na store (`useUserStore`), usuń `refreshKey`. Ale YAGNI: nie utrzymuj martwego kodu „na wszelki wypadek".

Jeśli grep pokaże realne użycie — zmigruj jak w Task 4.

- [ ] **Step 3: Typecheck + Commit** *(user commituje)*

Run: `cd frontend && npx tsc --noEmit` → 0 błędów.
Sugerowana wiadomość: `chore: remove dead UserInfo component` (lub `refactor` jeśli migrowany).

---

### Task 8: Weryfikacja końcowa + aktualizacja STATUS

- [ ] **Step 1: Pełna weryfikacja ręczna (checklist ze specu)**

Dev server, DevTools → Network:
1. Wejście na dashboard → **1×** `/users/me` (nie wiele).
2. Zmiana celów w profilu → `MacroSummary` pokazuje nowe wartości **bez** F5.
3. F5 na `/dashboard/profile` (deep-link) → dane usera się pojawiają (nie „Cześć, ...").
4. Logout → login → brak mignięcia poprzedniego usera.

- [ ] **Step 2: Ostateczny typecheck całego frontu**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 błędów.

- [ ] **Step 3: Zaktualizuj `Notes/STATUS.md`**

Odhacz: krok 5 (`useUserStore`), F5 (over-fetching), F4 (zduplikowane typy). Zaktualizuj datę „Ostatnia aktualizacja". (Zgodnie z zasadą: aktualizujemy TYLKO ten plik.)

- [ ] **Step 4: Commit** *(user commituje)*

Sugerowana wiadomość: `docs(status): mark useUserStore (F5/F4) done`

---

## Uwaga o TDD

Ten plan świadomie **nie** używa cyklu test-first, bo frontend nie ma jeszcze harnessu (Vitest + RTL — krok 6 w STATUS). Weryfikacja jest ręczna (dev server + Network) + statyczna (`tsc --noEmit`). Gdy powstanie harness (krok 6), naturalnym pierwszym testem jednostkowym będzie `useUserStore`: guard `fetchUser` (nie pobiera gdy `user !== null`), `setUser`, `clearUser`.
