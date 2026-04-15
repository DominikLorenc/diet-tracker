# Project Progress

## Snapshot (2026-04-15)

## Phase 2 Status (Frontend Plan)

### 1) Login (`/login`) — **85%**
- **UI:** 100% (page + form components exist).
- **API integration:** 85% (connected to `/users/login`).
- **Security:** 80% (cookie auth in place, needs stronger abuse test coverage).
- **Tests:** 40% (backend covered, frontend flow tests missing).

### 2) Register (`/register`) — **85%**
- **UI:** 100% (page + RHF + Zod form).
- **API integration:** 85% (connected to `/users/register`).
- **Security:** 80% (validation exists, needs stronger negative-path tests).
- **Tests:** 40% (no frontend automated tests yet).

### 3) Route protection — **80%**
- **UI/routing:** 90% (`/dashboard/:path*` protection configured).
- **API/session:** 80% (JWT cookie flow works, guard logic is basic).
- **Security:** 70% (needs explicit CSRF strategy review for cookie auth).
- **Tests:** 30% (no automated route-guard tests).

### 4) Dashboard layout — **75%**
- **UI:** 90% (sidebar/nav/layout present).
- **Feature completeness:** 60% (`/dashboard/progress` linked but missing page).
- **Security:** 80% (protected area).
- **Tests:** 20% (no frontend layout/navigation tests).

### 5) Diary page (`/dashboard`) — **65%**
- **UI/API:** 80% (fetch/add/delete flow present).
- **Security:** 40% (ownership/access-control gaps in diary service).
- **Data correctness:** 60% (needs user-scoped filtering verification).
- **Tests:** 45% (backend tests exist, not enough authz/integration coverage).

### 6) Products page — **70%**
- **UI:** 85% (search/product pages exist).
- **API integration:** 60% (query param mismatch risk: `search` vs `q`).
- **Security:** 65% (auth present, role policy for mutating global products unclear).
- **Tests:** 45% (backend tests exist, frontend and contract tests missing).

### Phase 2 Total (Weighted) — **77%**
- Biggest blockers to 100%: diary access control, search contract mismatch, missing `/dashboard/progress`, and missing frontend/integration tests.

### Done
- Frontend auth pages: `/frontend/app/login/page.tsx`, `/frontend/app/register/page.tsx`
- Frontend auth forms with Zod + RHF: `/frontend/app/_components/auth/`
- Dashboard layout + diary view: `/frontend/app/dashboard/layout.tsx`, `/frontend/app/dashboard/page.tsx`
- Product pages exist: `/frontend/app/dashboard/products/page.tsx`, `/frontend/app/dashboard/all/page.tsx`
- Backend core modules: auth, products, diary routes/controllers/services
- Basic backend security: JWT cookie auth, CORS, rate limiting, error handler
- Backend tests exist (Vitest + Supertest)

### In Progress / Partial
- Dashboard nav includes `/dashboard/progress`, but page is missing
- Test strategy is mostly mocked service-level checks
- Frontend automated tests are still missing

### Missing / TODO
- Add `/frontend/app/dashboard/progress/page.tsx` or remove nav link temporarily
- Unify product search query contract (`q` vs `search`)
- Add ownership checks in diary services and controllers
- Add integration tests with Prisma + DB
- Add coverage reporting and target threshold

## Next 5 Actions
1. Fix diary access control (filter by `userId` in read/delete flows).
2. Align frontend and backend product search query parameter.
3. Implement (or hide) dashboard progress page.
4. Add security-focused tests (multi-user isolation, unauthorized delete/update).
5. Enable and track backend test coverage.

## Notes
- Keep this file updated after each completed milestone.
- Keep entries short and actionable.
