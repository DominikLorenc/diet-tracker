# Security Checklist (OWASP-Oriented)

## For Every New/Changed Endpoint
- [ ] Validate input with strict schema (type, min/max, enum, format).
- [ ] Reject unexpected fields.
- [ ] Require authentication if endpoint is not public.
- [ ] Enforce authorization (owner check or role check).
- [ ] Return safe errors (no stack traces/SQL details).

## Common Attack Vectors

### Injection
- [ ] No raw SQL string concatenation with user input.
- [ ] Use parameterized queries / ORM safe patterns.
- [ ] Sanitize and validate search/filter parameters.

### Broken Authentication
- [ ] JWT secret is not hardcoded and is environment-driven.
- [ ] Cookies use secure flags in production (`httpOnly`, `secure`, `sameSite`).
- [ ] Login endpoint has brute-force/rate-limit protection.

### Broken Access Control
- [ ] User can only read/update/delete own resources unless admin.
- [ ] ID-based endpoints verify ownership before action.
- [ ] Admin-only actions enforce role checks explicitly.

### CORS and Session Safety
- [ ] CORS origin list is explicit (no wildcard with credentials).
- [ ] `credentials: true` is used only when needed.
- [ ] CSRF risk considered for cookie-based auth flows.

### Abuse and Availability
- [ ] Rate limiting covers sensitive endpoints.
- [ ] Expensive queries are paginated or bounded.
- [ ] File upload size/type limits exist (if uploads are enabled).

## Verification Notes
- [ ] I tested at least one unauthorized request per protected endpoint.
- [ ] I tested malformed payloads and confirmed proper 4xx response.
- [ ] I documented remaining security gaps if not fixed in this PR.
