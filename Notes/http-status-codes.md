# HTTP Status Codes — ściąga

## 2XX — Sukces

| Kod | Nazwa      | Kiedy używać                                                             |
| --- | ---------- | ------------------------------------------------------------------------ |
| 200 | OK         | Standardowa odpowiedź — GET, PUT, PATCH zakończone sukcesem              |
| 201 | Created    | Zasób został utworzony — po udanym POST (np. register, dodanie produktu) |
| 204 | No Content | Sukces ale bez treści odpowiedzi — np. po DELETE                         |

## 3XX — Przekierowania

| Kod | Nazwa             | Kiedy używać                           |
| --- | ----------------- | -------------------------------------- |
| 301 | Moved Permanently | Zasób przeniesiony na stałe (nowy URL) |
| 302 | Found             | Tymczasowe przekierowanie              |

## 4XX — Błąd klienta (użytkownik zrobił coś źle)

| Kod | Nazwa                | Kiedy używać                                                          |
| --- | -------------------- | --------------------------------------------------------------------- |
| 400 | Bad Request          | Niepoprawne dane w requeście (np. błąd walidacji Zod)                 |
| 401 | Unauthorized         | Brak autoryzacji — użytkownik nie jest zalogowany (brak/zły JWT)      |
| 403 | Forbidden            | Użytkownik zalogowany, ale nie ma uprawnień do tego zasobu            |
| 404 | Not Found            | Zasób nie istnieje (np. user o danym ID nie ma w bazie)               |
| 409 | Conflict             | Konflikt — zasób już istnieje (np. email już zajęty przy rejestracji) |
| 422 | Unprocessable Entity | Dane są poprawne składniowo, ale semantycznie błędne                  |
| 429 | Too Many Requests    | Rate limiting — za dużo requestów w krótkim czasie                    |

## 5XX — Błąd serwera (coś poszło nie tak po naszej stronie)

| Kod | Nazwa                 | Kiedy używać                                               |
| --- | --------------------- | ---------------------------------------------------------- |
| 500 | Internal Server Error | Ogólny błąd serwera — nieoczekiwany wyjątek, crash         |
| 502 | Bad Gateway           | Serwer dostał złą odpowiedź od upstream (np. baza danych)  |
| 503 | Service Unavailable   | Serwer niedostępny — przeciążony lub w trakcie maintenance |

---

## Zapamiętaj prosto

```
2XX = wszystko OK
4XX = Twoja wina (klient)
5XX = nasza wina (serwer)
```

---

## Najczęściej używane w REST API

```
GET    /products        → 200
POST   /products        → 201
DELETE /products/:id    → 204
POST   /register        → 201 (sukces) lub 409 (email zajęty)
POST   /login           → 200 (sukces) lub 401 (złe hasło)
GET    /protected       → 401 (brak tokenu) lub 403 (brak uprawnień)
```

5OIC6f3DwrQW0Trj
