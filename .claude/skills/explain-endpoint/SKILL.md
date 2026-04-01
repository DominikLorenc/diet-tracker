---
name: explain-endpoint
user-invocable: true
description: Analizuje endpoint Express — wyjaśnia co robi, jakie ma wektory ataku (OWASP), jak zabezpieczyć. Używaj przy nauce nowych endpointów lub security.
---

Przeczytaj wskazany endpoint Express (lub aktualnie otwarty plik jeśli nie podano ścieżki).

Następnie wyjaśnij w kolejności:

1. **Co robi ten endpoint** — prostymi słowami, bez żargonu
2. **Flow request → response** — krok po kroku przez middleware i logikę
3. **Wektory ataku (OWASP Top 10)** — dla każdego relevantnego:
   - Jak wyglądałby atak (pokaż przykład curl lub payload)
   - Jaki byłby skutek
   - Jak go zablokować
4. **Pytanie do użytkownika** — zadaj jedno pytanie sprawdzające czy rozumie mechanizm

Tłumacz po polsku. Używaj analogii do codziennych sytuacji gdy tłumaczysz ataki.
