# Design: Przeprojektowanie strony dodawania do dziennika

**Data:** 2026-04-15  
**Status:** Zatwierdzony

---

## Kontekst

Strona `/dashboard/add` pozwala użytkownikowi dodawać produkty do dziennika.  
Aktualnie obsługuje tylko produkty, ma zakomentowany bug przy recent searches, a ilość wpisuje się przez modal.  
Celem jest uczynienie tej strony bardziej intuicyjną i kompletną.

---

## Architektura ogólna

Strona `/dashboard/add` dostaje **3 zakładki**:

```
[ Produkty ]  [ Przepisy ]  [ Nowy produkt ]
```

- Aktywna zakładka trzymana w URL search param: `?tab=products` / `?tab=recipes` / `?tab=new`
- Po odświeżeniu użytkownik wraca do tej samej zakładki
- `mealType` i `date` nadal przekazywane przez URL params (bez zmian)

---

## Zakładka: Produkty

### Stan przed wyszukiwaniem

Dwie sekcje widoczne od razu:

1. **Ostatnio jedzone** (max 5 pozycji)
   - Źródło: istniejący endpoint `GET /recent-searches`
   - Naprawa buga: `addProductToDiary` było zakomentowane — trzeba odkomentować i podłączyć

2. **Ulubione produkty** (max 5 pozycji)
   - Źródło: nowy endpoint `GET /favorites/products`

### Wyszukiwanie

- Istniejący endpoint `GET /products/search`
- Wyszukiwanie na submit (bez zmian)

### Inline expand po kliknięciu produktu

Kliknięcie karty produktu **nie otwiera modala** — karta rozszerza się w miejscu:

```
[img] Kurczak pierś         ♥
      kcal / białko / tłuszcz / węgle
      ──────────────────────────────
      Ilość: [___] g    [Dodaj do dziennika]
```

- Pole ilości z domyślną wartością `100`
- Przycisk "Dodaj" wywołuje `POST /diary` i zwija kartę
- Serduszko ♥ toggleuje ulubione (POST lub DELETE `/favorites/products/:id`)

### Przycisk nowego produktu

- **Zawsze widoczny** w prawym górnym rogu sekcji: `+ Nowy produkt`
- **Dodatkowy reminder** gdy wyszukiwanie nie zwróci wyników: "Nie znaleziono? → Dodaj nowy produkt"
- Kliknięcie przełącza na zakładkę "Nowy produkt"

---

## Zakładka: Przepisy

### Stan przed wyszukiwaniem

1. **Ulubione przepisy** (max 5 pozycji)
   - Źródło: nowy endpoint `GET /favorites/recipes`

2. **Wszystkie przepisy użytkownika**
   - Źródło: istniejący `GET /recipes`
   - Przepisów zwykle jest mało, więc wyszukiwarka jest opcjonalna

### Inline expand po kliknięciu przepisu

Identyczne zachowanie jak dla produktów:

```
[ikona] Sałatka grecka       ♥
        ~450 kcal łącznie
        ──────────────────────────────
        Ilość: [___] g    [Dodaj do dziennika]
```

- Ilość w gramach (backend już to obsługuje przez `recipeId` w POST /diary)

### Brak przepisów

Gdy użytkownik nie ma żadnych przepisów: przycisk  
`→ Przejdź do kreatora przepisów` linkujący do `/dashboard/recipe-builder`

---

## Zakładka: Nowy produkt

- Istniejący `ProductForm` (z modala) wbudowany **bezpośrednio w zakładkę** — bez modala
- Po zapisaniu: automatyczne przełączenie na zakładkę "Produkty" + otwarcie nowo stworzonego produktu z inline expand

---

## Backend — zmiany

### Nowe modele Prisma

```prisma
model ProductFavorite {
  id        String   @id @default(uuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([userId, productId])
}

model RecipeFavorite {
  id        String   @id @default(uuid())
  userId    String
  recipeId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  recipe    Recipe   @relation(fields: [recipeId], references: [id])

  @@unique([userId, recipeId])
}
```

### Nowe endpointy — `/favorites`

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| GET | `/favorites/products` | Lista ulubionych produktów użytkownika |
| POST | `/favorites/products` | Dodaj produkt do ulubionych `{ productId }` |
| DELETE | `/favorites/products/:productId` | Usuń produkt z ulubionych |
| GET | `/favorites/recipes` | Lista ulubionych przepisów użytkownika |
| POST | `/favorites/recipes` | Dodaj przepis do ulubionych `{ recipeId }` |
| DELETE | `/favorites/recipes/:recipeId` | Usuń przepis z ulubionych |

### Logika toggle (frontend)

```
jeśli produkt jest w ulubionych → DELETE /favorites/products/:id
jeśli nie jest → POST /favorites/products { productId }
```

Stan serduszka aktualizowany optimistically (od razu w UI, bez czekania na odpowiedź).

---

## Komponenty frontend — podział

| Komponent | Opis |
|-----------|------|
| `AddPage` | Strona, zarządza stanem aktywnej zakładki |
| `ProductSearch` | Zakładka produktów (wydzielona z Search.tsx) |
| `RecipeSearch` | Zakładka przepisów (nowy komponent) |
| `ProductCard` | Karta produktu z inline expand + toggle ulubione |
| `RecipeCard` | Karta przepisu z inline expand + toggle ulubione |
| `NewProductForm` | ProductForm wbudowany w zakładkę (bez modala) |
| `FavoritesSection` | Sekcja "Ulubione" reużywalna dla produktów i przepisów |
| `RecentSection` | Sekcja "Ostatnio jedzone" |

---

## Co NIE wchodzi w scope

- Ręczne sortowanie ulubionych
- Foldery / kategorie ulubionych
- Wyszukiwanie wśród przepisów (opcjonalne, można dodać później)
- Edycja istniejących wpisów w dzienniku z tego widoku
