# 🥗 Diet Tracker

A full-stack diet & nutrition tracking application — plan meals, scan products by barcode,
generate shopping lists, and track body-measurement progress over time.

Built as a portfolio project to practice **production-grade full-stack patterns**:
strict TypeScript across the whole stack, **end-to-end type safety** (Zod → OpenAPI → typed
client), a layered backend, JWT auth, and automated API tests.

> 🚧 Actively developed — new features are added regularly.

![Diet Tracker — demo](./docs/demo.gif)

---

## ✨ Features

- 🔐 **Authentication** — register / login with JWT stored in an httpOnly cookie, bcrypt-hashed passwords, rate limiting
- 📊 **Food diary** — log meals and track daily macros & calories
- 📷 **Barcode scanner** — scan a product (camera) and pull nutrition data from the **Open Food Facts** API
- 🛒 **Shopping list** — auto-generated from your planned meals, with **PDF export**
- 📈 **Progress tracking** — record body measurements over time, visualised with charts
- 🖼️ **Image upload** — product images stored via Supabase Storage
- 📚 **Self-documenting API** — interactive Swagger UI generated from the same schemas that validate requests

---

## 🏗️ Architecture highlight — end-to-end type safety

The core idea: **a single source of truth for the API contract.**

```
Zod schemas (backend)  →  generated OpenAPI spec  →  typed API client (frontend)
```

1. Request/response shapes are defined once as **Zod** schemas and used to validate input at runtime.
2. Those schemas are turned into an **OpenAPI** spec (`zod-to-openapi`), served as Swagger docs.
3. The frontend generates a fully **typed client** from that spec (`openapi-typescript` + `openapi-fetch`).

The result: change the contract on the backend and the frontend **stops compiling** until it's
updated — no drift, no guessing, no manually-maintained types.

The backend follows a **layered architecture** — `routes → controllers → services → Prisma` —
with centralised error handling and middleware for auth, rate limiting and validation.

---

## 🧰 Tech stack

| | |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Zustand, React Hook Form + Zod, Recharts, react-zxing (barcode), jsPDF |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT + bcrypt, express-rate-limit, Zod |
| **API contract** | zod-to-openapi, Swagger UI, openapi-typescript, openapi-fetch |
| **Testing** | Vitest + Supertest (integration tests for the API) |
| **Tooling** | ESLint, Prettier, Husky, Nodemon, ts-node |

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- A PostgreSQL database
- (optional) A Supabase project — only needed for product-image upload

### 1. Clone

```bash
git clone https://github.com/DominikLorenc/diet-tracker.git
cd diet-tracker
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env          # then fill in the values
npm run prisma:generate
npm run prisma:devMigrate      # create the database schema
npm run dev                    # starts the API on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local         # then fill in the values
npm run dev                        # starts the app on http://localhost:3000
```

### 4. (optional) Regenerate the typed API client

With the backend running:

```bash
cd frontend
npm run generate:api
```

---

## 📚 API documentation

With the backend running, the interactive Swagger UI is available at:

```
http://localhost:4000/api/v1/docs
```

---

## 🧪 Tests

```bash
cd backend
npm test
```

Integration tests (Vitest + Supertest) cover authentication, users, recipes, the food diary and products.

---

## 📁 Project structure

```
.
├── backend/
│   └── src/
│       ├── controllers/   # request handlers
│       ├── services/      # business logic
│       ├── routes/        # route definitions
│       ├── middleware/    # auth, rate limiting, error handling
│       ├── schemas/       # Zod schemas (single source of truth)
│       ├── __tests__/     # Vitest + Supertest
│       └── ...
└── frontend/
    └── src/
        ├── app/           # Next.js app router
        ├── lib/api/       # generated, typed API client
        └── ...
```

---

## 📝 Note

Personal portfolio project, built to explore full-stack architecture and tooling.
Feedback and questions are welcome.
