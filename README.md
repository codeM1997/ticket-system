# Support Ticket Management

Internal support ticket system — React frontend, Express API, SQLite via Prisma.

## Prerequisites

- Node.js **v20.19.0** (pinned via `.nvmrc`)

```bash
nvm install
nvm use
```

## Setup (from clean clone)

### 1. Install dependencies

```bash
npm install
```

This installs root, client, and server workspaces via npm workspaces.

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` if you need a different port or database path.

### 3. Run database migrations

```bash
cd server
npx prisma migrate dev
```

### 4. Seed the database

```bash
cd server
npx prisma db seed
```

### 5. Start the server

```bash
npm run dev --workspace=server
```

Server runs on `http://localhost:3006` by default.

### 6. Start the client

In a separate terminal:

```bash
npm run dev --workspace=client
```

Vite proxies `/api` requests to the server automatically.

## Running tests

```bash
# All tests (server + client)
npm test

# Server only
npm test --workspace=server

# Client only
npm test --workspace=client
```

## Project structure

```
├── client/          React SPA (Vite + TypeScript)
├── server/          Express API (TypeScript + Prisma)
│   ├── prisma/      Schema, migrations, seed
│   ├── src/         Application source
│   └── tests/       Unit, property, and integration tests
├── kiro-specs/      Spec-driven development artifacts
└── .kiro/           Kiro IDE configuration
```

## Tech stack

- React 19, React Query, React Router
- Express 5, Prisma 7, SQLite (via better-sqlite3)
- Vitest, fast-check, supertest
