# Deployment Diet Tracker — design / mapa drogowa

> Data: 2026-06-02. Status: zaakceptowany plan, przed implementacją.
> Powiązane: `Notes/STATUS.md` (Faza 4 — Deployment + dług techniczny B1–B4, F7).

## Cel

Przenieść aplikację z `localhost` na publiczny hosting (24/7, dostępna pod URL),
w sposób bezpieczny i zrozumiały — pierwszy deploy autora, nacisk na naukę.

## Profil nauki (jak prowadzić implementację)

- Autor to **początkujący w deploju (pierwszy raz)** — celem jest nauczyć się
  *dobrego* deployu, nie tylko „postawić apkę".
- Każdy krok: najpierw KONCEPT i DLACZEGO, dopiero potem komenda/zmiana w kodzie.
- Tłumaczenie po polsku, analogie do codziennych sytuacji (zgodnie z `CLAUDE.md`).
- Wprowadzać po jednej nowej rzeczy naraz; nie kumulować niewiadomych.
- Wątki security (OWASP) omawiać przy okazji — to świadomy cel edukacyjny autora.
- Hint zamiast gotowca; zostawiać `TODO(human)` tam, gdzie autor ma spróbować sam.

## Wybrany stack

| Część | Host | Koszt | Uzasadnienie |
|-------|------|-------|--------------|
| Frontend (Next.js 15) | **Vercel** | free (Hobby) | natywny dla Next.js |
| Backend (Express) | **Railway** | ~$5/mc | bez usypiania (instant demo); Railway nie ma już free tier |
| Baza (PostgreSQL) | **Supabase** | free | konsolidacja z istniejącym Storage, GUI/SQL editor do nauki |
| Obrazki produktów | **Supabase Storage** | free | już używane |

Odrzucone alternatywy:
- **Model „wszystko na jednej platformie" / VPS** — VPS odłożony jako późniejsze ćwiczenie DevOps.
- **Neon / Render (free backend)** — Render odpada przez cold start; backend płatny dla płynności demo.
- **Supabase free pauzuje po ~tygodniu bezczynności** — akceptowalne dla portfolio (ręczny „Resume").

## Dwa kluczowe koncepty

### Zmienne środowiskowe
Kod czyta `process.env.*`; wartości podawane osobno — lokalnie w `.env` (nigdy do gita),
na produkcji w panelu Railway/Vercel. Lokalnie i na produkcji wartości są różne
(np. `DATABASE_URL`: localhost vs Supabase).

### Pułapka cross-domain cookie 🔴
Auth opiera się na JWT w httpOnly cookie. Lokalnie front i backend są na tym samym
`localhost` (same-site). Po deployu: front na `*.vercel.app`, backend na `*.railway.app`
— dwie różne domeny.

Obecne ustawienie (`backend/src/controllers/userController.ts:48`): `sameSite: 'strict'`
→ przeglądarka NIE dośle cookie cross-domain → logowanie pozornie zepsute (login OK,
kolejne żądania niezalogowane).

**Fix (produkcja):** `sameSite: 'none'` + `secure: true` + `app.set('trust proxy', 1)`.
Trade-off security: `SameSite` to mechanizm anty-CSRF; luzując go tracimy tę ochronę
— docelowo lepsza wspólna domena (`api.domena.pl` + `app.domena.pl`) i `SameSite=Lax`.

## Stan kodu (zweryfikowany 2026-06-02)

- Cookie: `httpOnly`, `maxAge 5h`, `sameSite: 'strict'`, `secure: NODE_ENV==='production'`.
- CORS (`backend/src/app.ts:20`): hardcoded `['http://localhost:3000','http://localhost:3001']`, `credentials: true`.
- Backend: port `4000`, base `/api/v1`, build `tsc`, start `node dist/index.js`; skrypt `prisma:migrate` = `prisma migrate deploy`.
- Frontend: `openapi-fetch` + `openapi-typescript`; brak `NEXT_PUBLIC_API_URL` (baseUrl do podpięcia pod env).
- `frontend/next.config`: `images.remotePatterns` hostname `"**"` (F7 — zawęzić do Supabase).
- DB lokalnie: `DATABASE_URL` → `localhost`.

## Mapa drogowa

### Faza 0 — Przygotowanie kodu (🔴 przed deployem)
1. **B1 + B2** — row-level authorization (diary, recipe): `userId` w `where`, właściciel z `req.userId`.
2. **Cross-domain cookie** — `sameSite: 'none'` w prod + `app.set('trust proxy', 1)`.
3. **B4** — CORS z env: `origin: process.env.CORS_ORIGINS.split(',')`.
4. **B3** — usunięcie `console.log` z produkcji.
5. **Frontend baseUrl → `NEXT_PUBLIC_API_URL`**.
6. **F7** — zawężenie `next.config` images do domeny Supabase.

### Faza 1 — Baza na Supabase
- Projekt Supabase → dwa connection stringi: *pooled* (6543, dla aplikacji) + *direct* (5432, dla migracji).
- Prisma: `DATABASE_URL` (pooled) + `DIRECT_URL` (direct).
- `npx prisma migrate deploy` → odtworzenie schematu w pustej bazie. Dane testowe NIE migrowane.

### Faza 2 — Backend na Railway
- Repo z GitHuba, root = `backend/`.
- Env: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGINS`, `PORT`.
- Build: `prisma generate && tsc`; start: `node dist/index.js`.
- Wynik: publiczny URL `*.railway.app`.

### Faza 3 — Frontend na Vercel
- Repo z GitHuba, root = `frontend/`.
- Env: `NEXT_PUBLIC_API_URL` = URL backendu z Fazy 2.
- Deploy → URL `*.vercel.app`.
- Powrót do Railway: `CORS_ORIGINS` = URL Vercela (problem jajka i kury — adresy znane dopiero po deployu).

### Faza 4 — Domknięcie
- Test pełnego flow: rejestracja + login (weryfikacja cookie cross-domain w DevTools), dodanie wpisu.
- `README.md` (uruchomienie + linki live).
- Aktualizacja `Notes/STATUS.md`.

**Kolejność:** baza → backend (potrzebuje URL bazy) → frontend (potrzebuje URL backendu).

### Faza 5 — CI/CD (PO pierwszym udanym deployu)
Cel dydaktyczny: zrozumieć różnicę CI vs CD i zbudować własny pipeline.

- **CD już działa** — Vercel/Railway auto-deployują przy push do `main` (skonfigurowane w Fazach 2–3).
  Uświadomienie sobie tego = połowa nauki o CD.
- **CI do dodania** — GitHub Actions (`.github/workflows/ci.yml`):
  - backend: `npm ci` → lint → `tsc --noEmit` → `vitest run` (istniejące testy integracyjne).
  - frontend: `npm ci` → lint → `tsc --noEmit` → `next build` (brak testów na razie).
  - uruchamiane na PR i push do `main`.
- **Brama jakości** — wymagać zielonego CI przed merge do `main` (branch protection),
  żeby auto-deploy ruszał tylko po przejściu testów.
- Rozważyć: usługa Postgres w jobie CI dla testów integracyjnych (Supertest).

Ulokowane PO Fazach 0–4 świadomie: pierwszy deploy to już dużo nowych pojęć
(env, cookie cross-domain, Prisma pooling) — nie kumulujemy ich z debugowaniem pipeline'u.
Najpierw żywa apka, potem automatyzacja.

## Otwarte tematy do rozwinięcia przy implementacji
- Dlaczego Prisma potrzebuje pooled + direct (pooling vs migracje).
- Szczegóły rozbrojenia cookie (warunkowa konfiguracja prod vs dev).
- Mechanizm CSRF i co tracimy przy `SameSite=None`.
- CI z bazą: usługa Postgres w GitHub Actions vs osobna baza testowa.
