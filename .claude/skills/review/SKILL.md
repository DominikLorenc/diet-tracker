---
name: review
user-invocable: true
description: Code review z naciskiem na security i best practices Next.js/Express/TypeScript. Używaj po napisaniu nowego kodu lub przed commitem.
---

Przeprowadź code review zmienionych lub wskazanych plików.

Skup się na:
1. **Security** — czy nie ma podatności (XSS, injection, broken auth, exposed secrets, brak walidacji inputu)
2. **TypeScript** — brak `any`, poprawne typy, zgodność z resztą projektu
3. **Next.js / Express best practices** — właściwe użycie App Router, middleware, error handling
4. **Architektura** — czy kod jest w odpowiednim miejscu, czy nie łamie separacji warstw
5. **Czytelność** — nazewnictwo, funkcje jednozadaniowe

Format odpowiedzi:
- Najpierw krótkie podsumowanie (co ogólnie jest dobrze)
- Potem lista problemów z wyjaśnieniem DLACZEGO to problem
- Na końcu 1-2 najważniejsze rzeczy do poprawienia

Pamiętaj: użytkownik się uczy — wyjaśniaj problemy, nie przepisuj kodu. Zadawaj pytania czy rozumie wskazany błąd.
