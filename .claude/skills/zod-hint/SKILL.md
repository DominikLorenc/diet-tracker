---
name: zod-hint
user-invocable: true
description: Patrzy na formularz lub endpoint i podpowiada jak zbudować schemat Zod — bez pisania gotowego kodu. Używaj przy nauce walidacji z React Hook Form + Zod.
---

Przejrzyj wskazany formularz (React Hook Form) lub endpoint (Express) — lub aktualny plik jeśli nie podano.

Następnie:

1. **Zapytaj** — czy użytkownik wie jak zabrać się za schemat Zod dla tego przypadku
2. **Jeśli nie wie** — wyjaśnij koncept Zod: czym jest schemat, po co istnieje, jak działa `.parse()` vs `.safeParse()`
3. **Daj wskazówki** (NIE gotowy kod):
   - Jakie pola wymagają walidacji
   - Jakie metody Zod są relevantne (np. `.min()`, `.email()`, `.regex()`)
   - Jak połączyć z React Hook Form przez `zodResolver`
4. **Zostaw TODO(human)** — zaznacz miejsca gdzie użytkownik powinien sam napisać kod
5. **Po próbie użytkownika** — sprawdź jego rozwiązanie i wyjaśnij co można poprawić

Tłumacz po polsku. Pamiętaj: celem jest nauka, nie gotowe rozwiązanie.
