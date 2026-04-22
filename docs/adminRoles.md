# Plan implementacji: Role adminów + UserRecipe

## Kontekst

- JWT token zawiera tylko `{ id: user.id }` — rola NIE jest w tokenie
- Model `User` ma już pole `role: Role` (USER / ADMIN) w bazie danych
- `req` ma rozszerzony typ tylko o `userId` — brak `role`
- Przepisy są globalne — brak `userId` na modelu `Recipe`

---

## Etap 1 — Dodaj `role` do JWT tokena

**Dlaczego:** Żeby `requireAdmin` middleware nie musiał chodzić do bazy przy każdym requescie.

**Pliki do zmiany:**
- `backend/src/services/userService.ts` — przy tworzeniu tokena dodaj `role` do payloadu
- `backend/src/types/express.d.ts` — dodaj `role` do rozszerzenia `Request`
- `backend/src/middleware/authMiddleware.ts` — odczytaj `role` z tokena i przypisz do `req.role`

**TODO(human):** Znajdź w `userService.ts` linię gdzie wywołujesz `jwt.sign(...)` i dopisz `role` do obiektu payloadu. Następnie zaktualizuj typ `Request`.

---

## Etap 2 — Stwórz middleware `requireAdmin`

**Dlaczego:** Oddzielny middleware zamiast if-a w kontrolerze — każda funkcja robi jedną rzecz, łatwiej podpiąć do trasy.

**Plik do stworzenia:**
- `backend/src/middleware/adminMiddleware.ts`

**Logika:**
1. Sprawdź czy `req.role` istnieje
2. Jeśli `req.role !== 'ADMIN'` → zwróć 403 Forbidden
3. Jeśli ok → `next()`

**TODO(human):** Napisz ten middleware samodzielnie — wzoruj się na `authMiddleware.ts`. Pamiętaj że `requireAdmin` zawsze chodzi PO `authMiddleware` (który ustawia `req.role`).

---

## Etap 3 — Zabezpiecz trasy przepisów

**Plik do zmiany:**
- `backend/src/routes/recipeRoutes.ts`

**Co zmienić:** `POST`, `PATCH`, `DELETE` wymagają roli ADMIN. `GET` pozostaje dla wszystkich zalogowanych userów.

**TODO(human):** Podepnij `requireAdmin` do odpowiednich tras. Zastanów się: czy stosujesz `router.use(requireAdmin)` dla całego routera czy dodajesz middleware do konkretnych tras? Która opcja jest lepsza i dlaczego?

---

## Etap 4 — Model UserRecipe (nowy model Prisma)

**Dlaczego:** User chce wziąć globalny przepis i dostosować go pod siebie — to osobna encja, nie modyfikacja oryginału.

**TODO(human):** Zaprojektuj model `UserRecipe` w `schema.prisma`. Musi mieć:
- powiązanie z userem (`userId`)
- nazwę
- składniki (relacja do produktów)
- opcjonalne pole `sourceRecipeId` — skąd pochodzi kopia (może być null jeśli user tworzy od zera)

Zaproponuj model przed uruchomieniem migracji — omówimy czy ma sens.

---

## Etap 5 — CRUD dla UserRecipe

Po zaakceptowaniu modelu:

- `backend/src/services/userRecipeService.ts`
- `backend/src/controllers/userRecipeController.ts`
- `backend/src/routes/userRecipeRoutes.ts`

**TODO(human):** Każda operacja (create, update, delete) musi weryfikować `userId` — user może edytować tylko swoje przepisy.

---

## Kolejność pracy

```
Etap 1 → Etap 2 → Etap 3 → Etap 4 → Etap 5
```

Etapy 1-3 są niezależne od 4-5. Możesz skończyć role adminów bez UserRecipe.

---

## Rzeczy do przemyślenia

- Co zwrócić gdy user bez roli ADMIN próbuje edytować przepis — 401 czy 403? Jaka różnica?
- Czy `UserRecipe` powinien móc mieć inne makro niż oryginał (bo user zmienia ilości składników)?
- Co się dzieje z `UserRecipe` gdy admin usunie oryginalny przepis (`sourceRecipeId` staje się invalid)?
