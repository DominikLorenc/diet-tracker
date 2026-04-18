# Plan implementacji — strona Postępów (`/dashboard/progress`)

**Data:** 2026-04-18  
**Spec:** `docs/superpowers/specs/2026-04-17-progress-page-design.md`  
**Design:** `desing.pen` → ramki `Progress - Desktop` i `Progress - Mobile`, modal `Modal - Dodaj Pomiar`

---

## Status backendu

Backend gotowy. Poprawki wprowadzone w tym sessie:
- `backend/src/schemas/measurements.ts` — dodano pole `date: z.coerce.date().optional()`
- `backend/src/services/measurementsService.ts` — `date` jako opcjonalny parametr z fallbackiem `new Date()`
- `backend/src/controllers/measurementsController.ts` — `date` wyciągane z body i przekazywane do serwisu

| Endpoint | Akcja |
|----------|-------|
| `GET /measurements` | Pobierz wszystkie pomiary usera |
| `POST /measurements` | Utwórz nowy pomiar |
| `PATCH /measurements/:id` | Edytuj pomiar |
| `DELETE /measurements/:id` | Usuń pomiar |

---

## Pliki do stworzenia

```
frontend/app/_types/measurements.ts           ← TODO(human)
frontend/app/_hooks/useMeasurements.ts        ← TODO(human)
frontend/app/_components/progress/
  MeasurementChart.tsx                        ← ✅ gotowe (Claude)
  MeasurementModal.tsx                        ← TODO(human)
  MeasurementHistoryTable.tsx                 ← TODO(human)
frontend/app/dashboard/progress/page.tsx      ← TODO(human)
```

---

## Krok 0 — Instalacja Recharts ✅

```bash
cd frontend && npm install recharts
```

---

## Krok 1 — Typy TypeScript

**Plik:** `frontend/app/_types/measurements.ts`

```ts
export type Measurement = {
  id: string
  userId: string
  weight: number
  waist: number
  hips: number
  arm: number
  date: string   // JSON nie ma Date — backend zwraca ISO string
}
```

> **TODO(human):** Napisz ten typ samodzielnie. Dlaczego `date` to `string` a nie `Date`?

---

## Krok 2 — Hook `useMeasurements`

**Plik:** `frontend/app/_hooks/useMeasurements.ts`

Hook powinien zwracać:
- `measurements: Measurement[]`
- `loading: boolean`
- `error: string | null`
- `refetch: () => void` — potrzebne po każdej mutacji (add/edit/delete)

Endpoint: `GET /measurements` → `{ measurements: Measurement[] }`

> **TODO(human):** Napisz hook używając `useState` + `useEffect`. Wzorzec masz w `DiaryDayView.tsx`.

---

## Krok 3 — `MeasurementModal.tsx`

**Plik:** `frontend/app/_components/progress/MeasurementModal.tsx`

Props:
```ts
type Props = {
  open: boolean
  onClose: () => void
  onSave: (data: MeasurementFormData) => Promise<void>
  initialData?: Measurement   // undefined = ADD, defined = EDIT
}
```

Zod schema:
```ts
const schema = z.object({
  date: z.string().min(1),
  weight: z.number({ coerce: true }).positive(),
  waist: z.number({ coerce: true }).positive(),
  hips: z.number({ coerce: true }).positive(),
  arm: z.number({ coerce: true }).positive(),
})
```

- Użyj `<Modal>` z `frontend/app/_components/shared/Modal.tsx`
- Styl inputów: `bg-[#162218] border border-[#1E3322] rounded-lg text-[#F3F7FF]`
- Przycisk zapisz: gradient `from-[#16A34A] to-[#15803D]`

> **TODO(human):** Formularz React Hook Form. Wskazówka: tryb EDIT — ustawiaj `defaultValues` przez `useEffect` gdy zmienia się `initialData`.

---

## Krok 4 — `MeasurementChart.tsx` ✅

**Plik:** `frontend/app/_components/progress/MeasurementChart.tsx`

Props:
```ts
type Props = {
  label: string               // "WAGA", "TALIA" itd.
  unit: string                // "kg" lub "cm"
  color: string               // "#4ADE80", "#F4C65D", "#F18FA3", "#7DB5FF"
  data: { date: string; value: number }[]
}
```

Mapa kolorów:

| Pomiar | `color`    | `label`  | `unit` |
|--------|-----------|---------|--------|
| Waga   | `#4ADE80` | `WAGA`  | `kg`   |
| Talia  | `#F4C65D` | `TALIA` | `cm`   |
| Biodra | `#F18FA3` | `BIODRA`| `cm`   |
| Ramię  | `#7DB5FF` | `RAMIĘ` | `cm`   |

---

## Krok 5 — `MeasurementHistoryTable.tsx`

**Plik:** `frontend/app/_components/progress/MeasurementHistoryTable.tsx`

Props:
```ts
type Props = {
  measurements: Measurement[]
  onEdit: (m: Measurement) => void
  onDelete: (id: string) => void
}
```

- Kolumny: `DATA | WAGA | TALIA | BIODRA | RAMIĘ | akcje`
- Nagłówek: IBM Plex Mono, `#4ADE80`, 11px, `letterSpacing: 2`
- Wiersze naprzemiennie: `bg-[#1A2B1F]` / `bg-[#162218]`
- Akcje: ✏️ edit, 🗑 delete — bez confirm dialogu
- Pusta lista: `"Brak pomiarów"` kolor `#9FB0C7`

> **TODO(human):** Wskazówka: `index % 2 === 0 ? 'bg-[#1A2B1F]' : 'bg-[#162218]'`

---

## Krok 6 — `page.tsx` (orchestrator)

**Plik:** `frontend/app/dashboard/progress/page.tsx`

Stan lokalny:
```ts
const [modalOpen, setModalOpen] = useState(false)
const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null)
```

Layout: `grid grid-cols-1 md:grid-cols-2 gap-4` dla wykresów

Nagłówek:
- data: `#8FA0B8`, Plus Jakarta Sans
- tytuł `"Postępy"`: Newsreader, `#F3F7FF`
- przycisk `+ Dodaj pomiar`: `hidden md:block`, gradient zielony

API calls w callbackach:
- Add → `POST /measurements`
- Edit → `PATCH /measurements/:id`
- Delete → `DELETE /measurements/:id`
- Po każdym: `refetch()`

> **TODO(human):** Sklej wszystkie komponenty w całość.

---

## Weryfikacja

1. `cd frontend && npm run dev`
2. Zaloguj się → `/dashboard/progress`
3. Dodaj pomiar z datą historyczną → pojawia się w tabeli i wykresach
4. Edytuj pomiar → dane się aktualizują
5. Usuń pomiar → znika bez confirm
6. Sprawdź responsywność — mobile: 1 kolumna wykresów

---

## Uwagi

- `date` z backendu to ISO string → w tabeli: `new Date(m.date).toLocaleDateString('pl-PL')`
- `Modal.tsx` używa `bg-gray-800` — nadpisz styl wewnątrz lub użyj `bg-[#111C14]` bezpośrednio
