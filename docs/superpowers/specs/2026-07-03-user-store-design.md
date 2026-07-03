# useUserStore — projekt (F5)

> Data: 2026-07-03. Status: zaakceptowany, gotowy do planu implementacji.
> Kontekst: krok 5 w `Notes/STATUS.md` — dług F5 (over-fetching `/users/me`). Zamyka przy okazji F4 (zduplikowane typy `User`/`UserGoals`).

## Problem

Dane zalogowanego usera (`/users/me`) są pobierane **niezależnie w 6 miejscach**:

- `app/dashboard/recipe-builder/page.tsx`
- `app/dashboard/recipes/page.tsx`
- `app/dashboard/profile/page.tsx`
- `app/_components/auth/UserInfo.tsx`
- `app/_components/dashboard/MacroSummary.tsx`
- `app/_components/dashboard/DiaryDayView.tsx`

Każde z nich robi własny `useState` + `useEffect` + `apiClient.GET("/users/me")`. Na jednym ekranie (np. dashboard: `DiaryDayView` + `MacroSummary`) ten sam request leci wielokrotnie. Typ `User`/`UserGoals` jest przy tym zduplikowany w 4 plikach (`profile/page`, `UserInfo`, `MacroSummary`, `DiaryDayView`).

Dodatkowo `UserInfo` używa hacka `refreshKey` (prop inkrementowany po zapisie celów), żeby wymusić ponowny fetch — bo nie ma współdzielonego stanu.

## Cel

Jedno współdzielone źródło danych usera w Zustandzie. Pobranie **raz** na sesję przeglądania, współdzielone przez wszystkich konsumentów. Jeden wspólny typ `User`.

## Decyzje projektowe (i dlaczego)

### Zakres: tylko dane usera, nie „auth"

Store trzyma **dane usera**, nie stan zalogowania. Token żyje w httpOnly cookie (niedostępny dla JS — celowo, ochrona przed XSS), a o wpuszczaniu/blokowaniu decyduje middleware + backend. Flaga `isAuthenticated` w store byłaby tylko kopią prawdy, która i tak jest po stronie serwera → ryzyko rozjazdu. `login`/`logout`/`isAuthenticated` **poza zakresem** (YAGNI).

Stąd nazwa `useUserStore` (nie „authStore").

### Punkt pobrania: `dashboard/layout.tsx`, nie „po zalogowaniu"

Store Zustanda żyje w pamięci JS → twardy refresh / deep-link (wklejenie URL, otwarcie z zakładki) czyści go do zera, ale cookie z tokenem zostaje. „Fetch po zalogowaniu" gubiłby przypadek refresh/deep-link (user zalogowany cookie, store pusty).

Rozwiązanie: `fetchUser()` w `dashboard/layout.tsx`, który renderuje się przy **każdym** wejściu w `/dashboard/*` (także po F5). Guard `if (user !== null) return` zapobiega ponownemu pobieraniu przy nawigacji client-side między stronami.

### Aktualizacja po zmianie celów: B2 (update z odpowiedzi, nie optymistycznie)

Po `PATCH /users/goals` store trzymałby stare `userGoals`, a `fetchUser` (guard `user !== null`) odmówiłby refetcha. Rozwiązanie: `PATCH` **już zwraca zaktualizowanego usera** — po sukcesie wołamy `setUser(zwrócony user)`.

Wybrano **B2 (update z odpowiedzi po sukcesie)** zamiast **B1 (optymistyczny + rollback)**: zapis celów to rzadki formularz ustawień, nie interakcja wrażliwa na opóźnienie (jak toggle/like). B2 nie pokazuje niepotwierdzonych danych i nie wymaga logiki rollbacku — przy błędzie store zostaje nietknięty, pokazujemy toast błędu. Optymizm (B1) nieuzasadniony tutaj.

## Architektura

### 1. `store/useUserStore.ts`

Prosty `create<UserState>` bez middleware — wzorzec identyczny jak istniejący `store/useToastStore.ts`.

```ts
interface UserState {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;   // guard: if (get().user !== null) return;
  setUser: (user: User) => void;    // po udanym PATCH /users/goals (B2)
  clearUser: () => void;            // reset przy logout
}
```

Zachowanie akcji:

- **`fetchUser()`** — jeśli `user !== null`, natychmiast return (guard). W przeciwnym razie: `isLoading = true`, `apiClient.GET("/users/me")`, na sukces `setUser` + `isLoading = false`, na błąd `isLoading = false` (user zostaje `null`), log błędu. Przekierowaniem przy wygasłym cookie zajmuje się middleware/apiClient, nie store.
- **`setUser(user)`** — `set({ user })`.
- **`clearUser()`** — `set({ user: null })`.

### 2. `app/_types/user.ts` (zamyka F4)

Jedno źródło typu, importowane przez store i wszystkich konsumentów. Kasuje 4 zduplikowane definicje.

```ts
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

> Uwaga implementacyjna: typ **manualny** (spójny z istniejącym wzorcem — dziś `User` jest ręcznie pisany w 4 plikach). Kształt wziąć 1:1 z `UserInfo.tsx`. Podczas migracji **zweryfikować** zgodność z tym, co realnie zwraca `apiClient.GET("/users/me")` (typ wygenerowany w `src/lib/api/schema.d.ts`) — jeśli pola się różnią, prawdą jest kontrakt OpenAPI, typ dostosować do niego.

### 3. Integracja

- **`dashboard/layout.tsx`** — `useEffect(() => { fetchUser(); }, [])`. Jedyny punkt pobrania.
- **6 konsumentów** — usunąć lokalny `useState`+`useEffect`+fetch, zamienić na `const user = useUserStore(s => s.user)`.
- **`profile/page.tsx`** — po udanym `PATCH /users/goals` wołać `setUser(zwrócony user)`; usunąć mechanizm `refreshKey` przekazywany do `UserInfo`.
- **Logout (2 miejsca:** `dashboard/layout.tsx`, `_components/shared/Navbar.tsx`**)** — po `apiClient.DELETE("/users/logout")` wołać `clearUser()`. Zapobiega mignięciu starego usera po wylogowaniu i zalogowaniu jako inny user bez pełnego reloadu.

## Stany brzegowe

- **Początkowy render** ma `user === null` zanim `fetchUser` wróci → `isLoading` pozwala pokazać spinner/skeleton zamiast „Cześć, ...". Konsumenci mogą adoptować `isLoading` stopniowo (dzisiejsze `?? "..."` nie wybucha przy `null`).
- **Błąd fetcha** — user zostaje `null`, `isLoading = false`, log błędu. Bez logiki przekierowań w store.
- **Wygasłe cookie** — poza zakresem store'a (middleware/apiClient).

## Testy / weryfikacja

Frontend ma **0 testów** i brak konfiguracji Vitest/RTL (osobny krok 6 w STATUS). Setup testów frontendu **poza zakresem** tego zadania. Weryfikacja **ręczna**:

1. Wejście na dashboard → w zakładce Network **1×** `/users/me` zamiast wielu.
2. Zmiana celów w profilu → `MacroSummary`/`UserInfo` pokazują nowe wartości **bez** F5.
3. F5 na `/dashboard/profile` (deep-link) → dane usera się pojawiają (nie „Cześć, ...").
4. Logout → login jako inny user → brak mignięcia poprzedniego usera.

Unit test store'a dopisać przy kroku 6, gdy powstanie harness testowy frontendu.

## Poza zakresem (świadomie)

- `login` / `logout` / `isAuthenticated` w store (zakres = tylko dane usera).
- Persist do `localStorage` / `sessionStorage`.
- Optymistyczny update (B1) + rollback.
- Setup testów frontendu (Vitest + RTL) — krok 6.

## Wpływ na STATUS.md po wdrożeniu

- Krok 5 (`useUserStore`) → zrobione.
- F5 (over-fetching `/users/me`) → zrobione.
- F4 (zduplikowane typy `User`/`UserGoals`) → zrobione (efekt uboczny).
