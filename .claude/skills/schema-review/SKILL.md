---
name: schema-review
user-invocable: true
description: Przegląda Prisma schema i tłumaczy decyzje modelowania danych — relacje, typy, indeksy, trade-offy. Używaj przy nauce baz danych lub projektowaniu modeli.
---

Przeczytaj plik `prisma/schema.prisma` z projektu.

Następnie omów:

1. **Modele i ich odpowiedniki w SQL** — pokaż jak Prisma model wygląda jako tabela SQL
2. **Relacje** — wyjaśnij każdą relację (1:1, 1:N, N:M) analogią z życia
3. **Decyzje projektowe** — dlaczego dane pole ma taki typ, nullable czy not null, unique
4. **Indeksy** — które pola powinny mieć indeks i dlaczego (wydajność zapytań)
5. **Potencjalne problemy** — N+1 query problem, brak kaskadowego usuwania, itp.
6. **Co Prisma robi "pod spodem"** — jakie SQL generuje dla typowych operacji

Tłumacz po polsku. Po omówieniu zapytaj użytkownika czy chciałby zobaczyć konkretne zapytanie SQL które Prisma generuje.
