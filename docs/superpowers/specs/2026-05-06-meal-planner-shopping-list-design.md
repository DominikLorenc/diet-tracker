# Meal Planner & Shopping List — Design Spec

Data: 2026-05-06

## Co budujemy

Dwie powiązane funkcje:

1. **Przycisk "zjedzone"** na pozycjach dziennika — rozróżnienie między zaplanowanym a faktycznie zjedzonym posiłkiem
2. **Interaktywna lista zakupów** — generowana z istniejącego dziennika dla wybranego zakresu dat

## Decyzje projektowe

- Planer ≠ nowy system. Dziennik już obsługuje przyszłe daty. Planer to inny widok tych samych danych.
- `isEaten` jest przechowywane w bazie danych (nie localStorage) — trwałe
- Lista zakupów: usuwanie pozycji to lokalny stan (sesja) — nie trzeba tego zapisywać
- Pobieranie danych dla zakresu dat: wiele równoległych zapytań do istniejącego `/diary?date=` (bez nowego endpointu range)

## Zmiany w bazie danych

Migracja już wykonana (`20260506183132_add_is_eaten`):

```prisma
model DiaryEntryItem {
  // ... istniejące pola ...
  isEaten Boolean @default(false)  // DODANE
}
```

---

## Faza 1: Przycisk "zjedzone"

### Backend

**Nowy endpoint:** `PATCH /diary/item/:itemId/eaten`

- Body: `{ isEaten: boolean }`
- Response: `{ item: DiaryEntryItem }`
- Wymaga: auth middleware + weryfikacja że item należy do zalogowanego usera
- Lokalizacja: `backend/src/controllers/diaryController.ts` + nowa trasa w routerze

### Frontend

**Zmiana w:** `frontend/app/_components/dashboard/DiaryDayView.tsx`

Każda pozycja w dzienniku dostaje przycisk toggle:
- Nieodhaczone: szary przycisk (np. `○`)  
- Odhaczone: zielony z checkmarkiem (`✓`), pozycja dostaje `opacity-50` + przekreślenie nazwy
- Kliknięcie wywołuje `PATCH /diary/item/:itemId/eaten` i aktualizuje lokalny stan

**Zmiana w typach:** `DiaryItem` interface dostaje pole `isEaten: boolean`

---

## Faza 2: Lista zakupów

### Nowa strona: `/dashboard/shopping-list`

**Plik:** `frontend/app/dashboard/shopping-list/page.tsx`

#### UI — dwa kroki:

**Krok 1: Wybór zakresu dat**
- Dwa date pickery: "Od" i "Do"
- Domyślnie: dziś → +6 dni (tydzień)
- Przycisk "Generuj listę"

**Krok 2: Lista zakupów**
- Pobiera `DiaryEntry` dla każdej daty w zakresie (równoległe Promise.all)
- Agreguje składniki:
  - `Product` item → dodaj `quantity` gramy do sumy dla tego produktu
  - `Recipe` item → rozwiń `recipe.products[]`, przeskaluj przez `item.quantity / suma gramatur przepisu`
  - `UserRecipe` item → rozwiń `userRecipe.userRecipeIngredients[]`, tak samo
- Wyświetla listę: nazwa produktu + łączna ilość w gramach
- Każda pozycja: przycisk "Mam już" → usuwa z listy (lokalny stan, `useState`)
- Przycisk "Resetuj" → przywraca usunięte pozycje
- Sortowanie: alfabetycznie

### Nawigacja

Dodać link do `/dashboard/shopping-list` w `Navbar.tsx` (np. ikona koszyka).

---

## Kolejność implementacji

1. [x] Migracja Prisma (`isEaten`) — **ZROBIONE**
2. [ ] Backend: endpoint `PATCH /diary/item/:itemId/eaten`
3. [ ] Frontend: toggle "zjedzone" w `DiaryDayView`
4. [ ] Frontend: strona `/dashboard/shopping-list` z date pickerem
5. [ ] Frontend: logika agregacji składników
6. [ ] Frontend: interaktywna lista (usuwanie pozycji)
7. [ ] Nawigacja: link w Navbar
