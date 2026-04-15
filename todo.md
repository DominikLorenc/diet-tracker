# Todo — 15.04.2026

## Zadania na dziś

---

### 🔧 TODO 1 — Refaktor: Search.tsx używa raw fetch zamiast apiClient

**Co:** `Search.tsx` ma dwie funkcje (`useEffect` + `handleAddProductToRecentSearches`) które wciąż używają `fetch()` bezpośrednio, podczas gdy cała reszta aplikacji używa `apiClient`.

**Pliki:**
- `frontend/app/_components/search/Search.tsx` — linie 62–108

**Dlaczego ważne:** Niespójność w warstwie HTTP to typowy dług techniczny. `apiClient` jest wygenerowany z OpenAPI — ma typy, obsługę błędów i credentials w jednym miejscu. Raw `fetch` omija to wszystko.

**Czego się nauczysz:**
- Dlaczego warto mieć jeden punkt dostępu do API (Single Responsibility)
- Jak przepisać raw `fetch` na `apiClient.GET` / `apiClient.POST`
- Jak `apiClient` automatycznie dołącza `credentials: "include"` — nie musisz tego pisać ręcznie

**Hint:** Zanim zaczniesz pisać — sprawdź jak `apiClient.GET("/diary", ...)` jest używany w `DiaryDayView.tsx`. Analogiczny pattern.

**Bonus:** W linii 58 jest literówka (`openMoadl`) — popraw przy okazji.

---

### 🐛 TODO 2 — Bug: błędny typ toasta przy usunięciu wpisu

**Co:** W `DiaryDayView.tsx` linia 168 — po udanym usunięciu wpisu wywołujesz:
```ts
showToast("error", "Wpis usunięty")  // ❌ błędny typ
```
Powinno być `"success"`, nie `"error"`.

**Dlaczego ważne:** Użytkownik widzi czerwony toast (błąd) gdy operacja się powiodła — to myląca informacja zwrotna (UX bug).

**Plik:** `frontend/app/_components/dashboard/DiaryDayView.tsx:168`

---

### 🔍 TODO 3 — Przejrzyj i przetestuj stronę /dashboard/add

**Co:** Wejdź na `/dashboard/add` i sprawdź ręcznie jak działa dodawanie posiłku do dziennika.

**Dlaczego ważne:** W git status widać wiele zmodyfikowanych plików — warto upewnić się że golden path działa zanim wrzucisz commit.

**Co sprawdzić:**
- [ ] Czy można dodać produkt do każdego typu posiłku (BREAKFAST, LUNCH, DINNER, SNACK)?
- [ ] Czy ilość (gramy) jest walidowana — co się stanie gdy wpiszesz `0` lub `-100`?
- [ ] Czy po dodaniu wpis pojawia się natychmiast w dzienniku bez odświeżania?
- [ ] Czy toast po dodaniu ma właściwy typ (`success`)?

**Jeśli znajdziesz bug** — otwórz issue lub dodaj go do tego pliku jako TODO 4.
