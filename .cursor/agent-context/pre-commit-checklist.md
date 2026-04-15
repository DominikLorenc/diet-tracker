# Pre-Commit Checklist

## Scope and Quality
- [ ] I understand what problem this commit solves.
- [ ] Changes are minimal and focused (no unrelated edits).
- [ ] No `any` added in TypeScript.
- [ ] Function and variable names are clear and in English.

## Security (Backend + API)
- [ ] Input validation exists (Zod/schema) for new/changed endpoints.
- [ ] AuthN/AuthZ rules are enforced (owner/role checks where needed).
- [ ] No sensitive data is leaked in logs or responses.
- [ ] Rate limiting / abuse controls are considered for public endpoints.

## Frontend Contract
- [ ] Frontend request matches backend API contract (path, method, payload, query).
- [ ] Error states are handled in UI (loading/error feedback).
- [ ] Protected pages/routes are still properly guarded.

## Tests and Verification
- [ ] Relevant tests pass (`backend` and/or `frontend`).
- [ ] New behavior has tests or at least manual test notes.
- [ ] Lint/typecheck passes for touched areas.

## Hygiene
- [ ] No secrets committed (`.env`, tokens, keys, credentials).
- [ ] README/docs updated if behavior changed.
- [ ] Commit message explains *why* change was made.
