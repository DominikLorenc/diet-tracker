# Progress Page Design

**Data:** 2026-04-17  
**Strona:** `/dashboard/progress`  
**Status:** Zatwierdzony

---

## Cel

Strona umożliwia użytkownikowi śledzenie postępów sylwetkowych w czasie. Dane to pomiary ciała z modelu `BodyMeasurement` (waga, talia, biodra, ramię). Strona zapewnia pełne CRUD: dodawanie, edycję i usuwanie pomiarów, wizualizację trendów przez wykresy oraz historię wszystkich wpisów.

---

## Layout — Scrollable Dashboard

Strona scrolluje się pionowo. Bez zakładek, bez splitów — wszystko w jednym widoku.

### 1. Nagłówek

- Mała etykieta: aktualna data, styl `#8FA0B8`, font Plus Jakarta Sans
- Duży tytuł: `"Postępy"`, font Newsreader, kolor `#F3F7FF`
- Przycisk `+ Dodaj pomiar` po prawej (tylko desktop) lub sticky button na mobile — zielony gradient `#16A34A → #15803D`, otwiera modal

### 2. Grid wykresów (2×2)

Cztery karty bento w układzie 2 kolumny (desktop) / 1 kolumna (mobile). Każda karta zawiera:

- Etykieta IBM Plex Mono u góry (np. `WAGA`)
- Aktualna wartość dużym fontem (IBM Plex Mono, `#F3F7FF`)
- Delta od pierwszego pomiaru małym tekstem — neutralny kolor `#94A3B8`, strzałka ↑/↓ bez oceniania kierunku (użytkownik może być na masie, redukcji lub utrzymaniu)
- `LineChart` z Recharts: oś X to daty, oś Y to wartości

Kolory linii wykresów (spójne z design systemem makr):

| Pomiar | Kolor | Uzasadnienie |
|--------|-------|--------------|
| Waga | `#4ADE80` | Primary green — najważniejszy pomiar |
| Talia | `#F4C65D` | Żółty — jak węglowodany |
| Biodra | `#F18FA3` | Różowy — jak tłuszcze |
| Ramię | `#7DB5FF` | Niebieski — jak białko |

Styl kart: `background: #1A2420`, `border: 1px solid #1E3322`, `borderRadius: 16px`, `boxShadow: 0 1px 20px rgba(34,197,94,0.09)`.

### 3. Tabela historii

Pod wykresami, pełna szerokość. Styl spójny z istniejącymi komponentami dashboardu.

Kolumny: `DATA | WAGA | TALIA | BIODRA | RAMIĘ | akcje`

- Nagłówek tabeli: IBM Plex Mono, `#4ADE80`, `font-size: 11px`, `letter-spacing: 2`
- Wiersze: naprzemienne tło `#1A2B1F` / `#162218`, border-top `#1E3322`
- Akcje per wiersz: ikona ✏️ (edit — otwiera modal z wypełnionymi danymi) i 🗑 (delete — inline usunięcie bez dodatkowego potwierdzenia)
- Pusta lista: komunikat "Brak pomiarów" w stylu `#9FB0C7`

---

## Modal — Dodaj / Edytuj pomiar

Jeden modal obsługuje oba przypadki (add i edit). Pola formularza:

- **Data** — date picker (type="date"), domyślnie dzisiaj
- **Waga (kg)** — number input
- **Talia (cm)** — number input
- **Biodra (cm)** — number input
- **Ramię (cm)** — number input

Walidacja: React Hook Form + Zod. Wszystkie pola wymagane, wartości > 0.

Styl modalu: spójny z `Modal.tsx` już istniejącym w projekcie (`#111C14`, border `#1E3322`).

---

## Biblioteka wykresów

**Recharts** — najprostsza opcja dla React, zero dodatkowej konfiguracji. Używamy tylko `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`.

---

## Komponenty do stworzenia

```
frontend/app/_components/progress/
  MeasurementChart.tsx      — pojedyncza karta z wykresem
  MeasurementHistoryTable.tsx — tabela historii
  MeasurementModal.tsx      — modal dodaj/edytuj
frontend/app/dashboard/progress/
  page.tsx                  — główna strona (orchestrator)
```

---

## API

Używamy istniejących endpointów:

| Akcja | Endpoint |
|-------|----------|
| Pobierz wszystkie | `GET /measurements` |
| Utwórz | `POST /measurements` |
| Edytuj | `PATCH /measurements/:id` |
| Usuń | `DELETE /measurements/:id` |

---

## Design tokens (z istniejącego systemu)

```
Tło strony:    #0F1A10
Karty:         #1A2420 / #162218
Border:        #1E3322
Tekst primary: #F3F7FF
Tekst muted:   #9FB0C7
Green primary: #4ADE80
Gradient:      #16A34A → #15803D

Fonty:
  Display:  Newsreader       (var(--font-newsreader))
  Data:     IBM Plex Mono    (var(--font-ibm-plex-mono))
  UI:       Plus Jakarta Sans (var(--font-jakarta))
```

---

## Responsywność

- **Desktop:** grid 2×2 dla wykresów, tabela pełna szerokość
- **Mobile:** grid 1 kolumna, tabela z poziomym scrollem (overflow-x-auto)
