---
name: test-hint
user-invocable: true
description: Patrzy na funkcję lub endpoint i pomaga napisać testy — pyta czy wiesz jak podejść, daje wskazówki do Vitest/Supertest. Nie pisze gotowych testów.
---

Przeczytaj wskazaną funkcję lub endpoint — lub aktualny plik jeśli nie podano.

Następnie:

1. **Zapytaj** — czy użytkownik wie jak przetestować ten kod i co warto sprawdzić

2. **Jeśli nie wie** — wyjaśnij strategię testowania:
   - Co to jest unit test vs integration test vs e2e test
   - Który typ pasuje do tego kodu i dlaczego
   - Jakie przypadki brzegowe warto przetestować (happy path, error path, edge cases)

3. **Daj wskazówki** (NIE gotowy kod):
   - Jak skonfigurować Vitest / Supertest dla tego przypadku
   - Jak mockować zależności (Prisma, zewnętrzne serwisy)
   - Jakie asercje mają sens
   - Przykład struktury `describe` / `it` bez implementacji

4. **Zostaw TODO(human)** — niech użytkownik sam napisze testy

5. **Po próbie** — przejrzyj napisane testy i wskaż co można ulepszyć

Tłumacz po polsku. Pamiętaj o stack: Vitest + Supertest (backend), Playwright (e2e).
