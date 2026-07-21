# Candidate Information

Name: Anshul Mittal / Role: SSE / Primary Technology Stack: TypeScript, React, Node.js/Express, Prisma, SQLite

Primary AI Tool Used: Kiro (AI-powered IDE) / Project Option Selected: Internal Support Ticket Management System



## Project Summary

Full-stack internal support ticket management system built with React 19 frontend (Vite, TanStack React Query, React Router) and Express 5 backend (Prisma 7, SQLite via better-sqlite3). Features include ticket CRUD, state machine lifecycle transitions, commenting, search/filter, comprehensive input validation, and structured error handling. Test coverage includes unit, property-based (fast-check), and integration tests (supertest).

## Tools Used

- **IDE**: Kiro (AI-powered IDE built on VS Code)
- **AI Assistant**: Kiro built-in AI (spec-driven development workflow)
- **Runtime**: Node.js v20.19.0
- **Package Manager**: npm (workspaces)
- **Build Tools**: Vite (client), tsc + tsx (server)
- **Test Runner**: Vitest
- **Database**: SQLite via Prisma ORM
- **Version Control**: Git

## Setup Summary

1. Clone repository
2. `nvm use` (Node.js 20.19.0)
3. `npm install` (root — installs all workspaces)
4. `cp server/.env.example server/.env`
5. `cd server && npx prisma migrate dev` (create database)
6. `cd server && npx prisma db seed` (seed 3 users)
7. `npm run dev --workspace=server` (start API on port 3006)
8. `npm run dev --workspace=client` (start UI with Vite proxy)
9. `npm test` (run all tests)
