# Diet Tracker — TODO

## Co mamy gotowe ✅

### Faza 1 — Backend (kompletna)
- **Auth:** register, login, JWT middleware, httpOnly cookie
- **Products:** CRUD, wyszukiwanie, integracja Open Food Facts (cache-aside)
- **Diary:** GET/POST/DELETE wpisów
- **Recipes:** pełny CRUD (tworzenie przepisów ze składników)
- **User:** goals endpoint
- **Recent Searches:** service, controller, routes
- **Testy integracyjne:** auth, diary, products, recipes, user

### Faza 2 — Frontend (prawie kompletna)
- `/login`, `/register` — formularze z RHF + Zod
- `/dashboard` — `DiaryDayView`, `DateNavigator`, `MacroSummary`
- `/dashboard/add` — dodawanie wpisu do dziennika
- `/dashboard/products` — strona produktów
- `/dashboard/recipe-builder` — kreator przepisów
- `/dashboard/recipes` — lista przepisów
- **Toast notifications** — `useToastStore` (Zustand), komponent `<Toast>`, animacja, podpięty w: dodawanie/edycja produktu, usuwanie wpisu z dziennika, usuwanie produktu, dodawanie do dziennika

---

## Do zrobienia

### Faza 2 — Frontend (reszta)
- [ ] **Profil użytkownika** `/dashboard/profile` — formularz edycji celów kalorycznych (komponenty gotowe, brakuje podpięcia do API)
- [ ] **Loading skeletony i empty states** — UX przy ładowaniu danych
- [ ] **Refactor shared komponentów** — Button, Input, Card (reużywalne)

### Faza 3 — Testy + Zustand
- [x] **Zustand** — `useToastStore` gotowy (pierwszy store)
- [ ] **Zustand** — `useAuthStore` (user state, isAuthenticated)
- [ ] **Unit testy frontend** — komponenty, hooki (Vitest + RTL)
- [ ] **E2E Playwright** — pełny flow logowania, dodawania posiłku

### Faza 4 — Deployment
- [ ] Deploy backendu na Railway
- [ ] Deploy frontendu na Vercel
- [ ] README.md

---

## Sugerowana kolejność

1. Profil użytkownika — ostatni brakujący ekran UI
2. Loading skeletony i empty states
3. useAuthStore (Zustand)
4. Deploy — żeby projekt żył publicznie
5. Wyróżniki (Faza 5): wykresy, eksport CSV, AI foto-logowanie
