---
name: security-checklist
user-invocable: true
description: Sprawdza wskazane pliki lub ostatnie zmiany (git diff) pod kątem OWASP Top 10. Używaj przed commitem lub code review.
---

Przeczytaj wskazane pliki lub uruchom `git diff HEAD` żeby zobaczyć ostatnie zmiany.

Sprawdź każdy punkt checklist i zaznacz: ✅ OK / ⚠️ Do sprawdzenia / ❌ Problem

**OWASP Top 10 checklist:**

1. **Injection** — czy dane od użytkownika są sanityzowane przed użyciem w zapytaniach?
2. **Broken Authentication** — czy JWT jest weryfikowany, czy tokeny mają expiry?
3. **Sensitive Data Exposure** — czy hasła są hashowane, czy wrażliwe dane nie są logowane?
4. **Broken Access Control** — czy użytkownik może dostać się tylko do swoich zasobów?
5. **Security Misconfiguration** — CORS, nagłówki HTTP, tryb debug, domyślne hasła
6. **XSS** — czy dane są escapowane przed wyświetleniem w HTML?
7. **Insecure Deserialization** — czy JSON z zewnątrz jest walidowany schematem (Zod)?
8. **Using Components with Known Vulnerabilities** — (pomijamy, wymaga npm audit)
9. **Insufficient Logging** — czy błędy auth są logowane?
10. **SSRF** — czy aplikacja nie wykonuje requestów do URL-i podanych przez użytkownika?

Dla każdego znalezionego problemu (❌): wyjaśnij co jest nie tak i jak to naprawić.
Tłumacz po polsku.
