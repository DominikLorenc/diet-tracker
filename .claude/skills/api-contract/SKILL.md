---
name: api-contract
user-invocable: true
description: Porównuje wywołania API na frontendzie z definicjami endpointów na backendzie i wykrywa niezgodności typów, brakujące pola, błędne metody HTTP.
---

Przeszukaj projekt i znajdź:
1. Pliki frontend z wywołaniami API (apiClient, fetch, axios) — zwykle w `src/` lub `app/`
2. Pliki backend z definicjami endpointów (Express routes) — zwykle w `backend/` lub `server/`

Następnie porównaj dla każdego endpointu:

| Endpoint | Frontend wysyła | Backend oczekuje | Niezgodność? |
|----------|----------------|-----------------|--------------|

Sprawdź:
- **Metoda HTTP** — czy frontend używa POST a backend oczekuje PATCH?
- **URL** — czy ścieżki się zgadzają, czy są literówki?
- **Body** — czy nazwy pól się zgadzają (camelCase vs snake_case)?
- **Typy** — czy frontend wysyła string tam gdzie backend oczekuje number?
- **Brakujące pola** — czy frontend pomija wymagane pola?
- **Nadmiarowe pola** — czy frontend wysyła pola których backend nie obsługuje?
- **Response** — czy frontend poprawnie odczytuje strukturę odpowiedzi?

Dla każdej niezgodności wyjaśnij jaki błąd to spowoduje w runtime.
Tłumacz po polsku.
