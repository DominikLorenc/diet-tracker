# Edytowalna ilość produktu w dzienniku (/dashboard)

## Kontekst

W `DiaryDayView.tsx` każdy wpis dziennika (`DiaryItem`) wyświetla ilość produktu jako statyczny tekst `{item.quantity}g`. Użytkownik chce móc edytować tę wartość bezpośrednio w widoku dziennika, bez usuwania i ponownego dodawania wpisu.

Podział pracy: **frontend implementuje Claude, backend implementuje user** (backend to warstwa, której user się uczy w tym projekcie — patrz `CLAUDE.md`). Design poniżej definiuje kontrakt API, który frontend zakłada jako gotowy; implementacja backendu jest zadaniem do samodzielnego wykonania z hintami (nie gotowym kodem).

## Zakres

- Edycja dotyczy **tylko** wpisów będących pojedynczym produktem (`item.product`, gdy `!item.recipe && !item.userRecipe`) — dokładnie tam, gdzie ilość jest już dziś widoczna.
- Przepisy (`recipe` / `userRecipe`) — poza zakresem, bez zmian.
- Bez testów na tym etapie (świadoma decyzja — można dodać później).

## 1. Interakcja (UX)

- Tekst `{item.quantity}g` staje się klikalny.
- Klik → w tym samym miejscu pojawia się `<input type="number">` z aktualną wartością, `autoFocus` + zaznaczenie zawartości (`select()`), tak jak w `AddProductCard.tsx`.
- **Enter** lub **blur** → zapis (wywołanie API), input znika, wraca tekst z nową wartością.
- **Escape** → anulowanie, powrót do poprzedniej wartości bez zapisu.
- Walidacja klienta: liczba całkowita, `min=1`, bez górnego limitu.
- Jeśli wartość niezmieniona względem oryginału — pomijamy request całkowicie.
- Jeśli wartość pusta/nieprawidłowa (≤0, nie-liczba) przy próbie zapisu — cichy powrót do poprzedniej wartości, bez requestu i bez toastu (to invalid input użytkownika, nie błąd systemu).
- **Optimistic update**: kalorie/makra w wierszu (`getItemMacros`) i w `MacroSummary` przeliczają się natychmiast po zmianie stanu, przed odpowiedzią API.
- Błąd requestu (4xx/5xx) → rollback stanu `entries` do wartości sprzed edycji + `showToast("error", "Nie udało się zaktualizować ilości", "Spróbuj ponownie lub odśwież stronę")` — wzorzec identyczny jak `handleDeleteItem`/`handleEaten`.

## 2. Komponenty (frontend)

### Nowy komponent: `frontend/app/_components/dashboard/EditableQuantity.tsx`

Odpowiedzialność: przełączanie tekst ↔ input, walidacja lokalna, wywołanie callbacka. Nie zna się na API ani na strukturze `DiaryItem`.

```ts
type Props = {
  quantity: string;       // aktualna wartość jako string (jak w DiaryItem.quantity)
  onSave: (newQuantity: number) => Promise<void>;
};
```

Stan wewnętrzny: `isEditing: boolean`, `inputValue: string`.

### `DiaryDayView.tsx`

- W miejscu obecnego `{item.quantity}g` (linia ~391, wewnątrz `{!item.recipe && !item.userRecipe && (...)}`) renderujemy:
  `<EditableQuantity quantity={item.quantity} onSave={(q) => handleUpdateQuantity(item.id, q)} />`
- Nowa funkcja `handleUpdateQuantity(id: string, quantity: number)`:
  - Zapamiętuje poprzednią wartość (do rollbacku).
  - Optimistic update: `setEntries` z nową wartością `quantity` dla danego `item.id`.
  - `apiClient.PATCH("/diary/{id}/quantity", { params: { path: { id } }, body: { quantity } })`.
  - Przy błędzie: rollback + toast (jak wyżej).

## 3. Kontrakt API (backend — TODO(human))

Wzorzec 1:1 z istniejącym `PATCH /diary/:id/eaten`.

- **Route**: `PATCH /diary/:id/quantity`
- **Request body**: `{ quantity: number }`
- **Response 200**: `{ message: string, updated: <DiaryItem> }`
- **Walidacja** (Zod): `updateQuantitySchema = z.object({ quantity: z.number().min(1) })`

### Warstwy do zaimplementowania (hinty, nie gotowy kod)

1. **`backend/src/schemas/diarySchema.ts`** — dodaj `updateQuantitySchema` obok `toggleEatenSchema`, ten sam styl (`z.object({...})`).
2. **`backend/src/services/diaryService.ts`** — dodaj `updateDiaryItemQuantity(id, userId, quantity)`. Podejrzyj `updateDiaryEntry` (obsługuje `toggleEaten`) — jak sprawdza, że `DiaryItem` należy do usera przez relację `diaryEntry.userId`, zanim zrobi `update`. Ta sama logika własności musi zadziałać tu.
3. **`backend/src/controllers/diaryController.ts`** — dodaj `updateQuantityItem`, skopiuj strukturę `toggleEatenItem` (walidacja `id` przez `diaryIdSchema`, walidacja body przez nowy schema, wywołanie service, response).
4. **`backend/src/routes/diaryRouter.ts`** — `router.patch('/:id/quantity', updateQuantityItem);`
5. **`backend/src/docs/diaryDocs.ts`** — wpis OpenAPI dla nowej trasy, analogicznie do istniejącego wpisu dla `/eaten`. **Ważne**: bez tego frontendowy `apiClient` (typowany z wygenerowanego OpenAPI schema) nie będzie znał trasy `/diary/{id}/quantity` i frontend się nie skompiluje — to musi powstać zanim frontend zacznie z tego korzystać.

## 4. Kolejność pracy

Ponieważ frontend zakłada istnienie endpointu (typy z `apiClient` generowane z OpenAPI), backend (przynajmniej punkty 1, 4, 5 — schema, routing, docs) musi powstać **przed** albo **równolegle z** frontendem, żeby `apiClient.PATCH("/diary/{id}/quantity", ...)` w ogóle się kompilowało. Plan implementacji uwzględni to jako pierwszy krok (TODO dla usera), a frontend jako kolejny krok (Claude).
