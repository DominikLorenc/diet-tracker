# Progress page — TODO dla Ciebie

## 1. Hook `useMeasurements`

**Plik:** `frontend/app/_hooks/useMeasurements.ts`

Zastąp stub prawdziwą implementacją. Wzorzec masz w `DiaryDayView.tsx`.

- `useState` dla `measurements`, `loading`, `error`
- `useEffect` który wywołuje `GET /measurements`
- `refetch` to funkcja która re-triggeruje fetch (np. przez toggle stanu)
- Odpowiedź backendu: `{ measurements: Measurement[] }`

---

## 2. Callbacki API w `page.tsx`

**Plik:** `frontend/app/dashboard/progress/page.tsx`

Uzupełnij 3 funkcje (linie ~70–80):

```ts
const handleAdd = async (data: MeasurementFormData) => {
  // POST /measurements z body: data
  // po sukcesie: refetch()
}

const handleEdit = async (data: MeasurementFormData) => {
  if (!editingMeasurement) return
  // PATCH /measurements/:editingMeasurement.id z body: data
  // po sukcesie: refetch()
}

const handleDelete = async (id: string) => {
  // DELETE /measurements/:id
  // po sukcesie: refetch()
}
```

Użyj `apiClient` tak jak w innych miejscach projektu.

---

## Weryfikacja po implementacji

1. `cd frontend && npm run dev`
2. Zaloguj się → `/dashboard/progress`
3. Dodaj pomiar z datą historyczną → pojawia się w tabeli i wykresach
4. Edytuj pomiar → dane się aktualizują
5. Usuń pomiar → znika bez confirm
6. Zmień filtr dat / preset → wykresy i tabela się filtrują
