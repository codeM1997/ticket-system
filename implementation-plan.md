# Implementation Plan

## Overview

Full-stack support ticket management system built as a monorepo with npm workspaces. Bottom-up implementation: database layer → state machine + validation → API routes → integration/property tests → frontend types/API client → UI components → documentation.

## Task Breakdown

### Phase 1: Foundation (Backend Infrastructure)
1. Bootstrap monorepo with npm workspaces (`client/`, `server/`)
2. Set up backend project skeleton (Express, Prisma, TypeScript, Vitest)
3. Define Prisma schema (User, Ticket, Comment) and run initial migration
4. Implement seed script (3 users, idempotent upsert)

### Phase 2: Core Business Logic
5. Implement state machine module (`canTransition`, `getValidTransitions`)
6. Implement input validation module (ticket create/update, comment create, transition)
7. Implement error handling middleware (AppError class, Prisma error mapping)

### Phase 3: API Routes
8. Implement users route (GET /api/users)
9. Implement ticket routes (POST, GET list, GET detail, PATCH, POST transitions)
10. Implement comment route (POST /api/tickets/:id/comments)

### Phase 4: Testing
11. Unit tests for state machine
12. Property-based tests (9 suites covering 15+ correctness properties)
13. Integration tests for state machine over HTTP (valid + invalid transitions)

### Phase 5: Frontend
14. Set up frontend skeleton (Vite + React + TypeScript + React Query + React Router)
15. Define shared types and API client with centralized error parsing
16. Implement React Query hooks with query invalidation
17. Build UI components (TicketList, TicketDetail, TicketForm, CommentForm, SearchFilter, StatusBadge, TransitionButtons, ErrorMessage)
18. Wire routes and add error boundary

### Phase 6: Polish & Documentation
19. Project documentation (README, .env.example, .gitignore)
20. Final verification — all tests pass

## Milestones

| Milestone | Description | Criteria |
|-----------|-------------|----------|
| M1 | Backend API functional | All endpoints respond correctly, tests pass |
| M2 | State machine verified | Integration + property tests prove all transitions |
| M3 | Frontend functional | Full CRUD workflow through UI |
| M4 | Submission ready | All tests pass, docs complete, no secrets committed |

## AI Usage Plan

- **Spec-driven development**: Use Kiro's spec workflow (requirements → design → tasks) to structure the build
- **Code generation**: AI generates boilerplate (Prisma schema, Express routes, React components) from design doc
- **Test generation**: AI produces property tests from correctness properties in design
- **Code review**: AI reviews generated code for edge cases, security, and best practices
- **Debugging**: AI assists with diagnosis when tests fail or runtime errors occur

## Risks

| Risk | Likelihood | Impact |
|------|-----------|--------|
| SQLite limitations (no case-insensitive LIKE) | High | Medium |
| Prisma adapter compatibility issues | Medium | High |
| Concurrent state transitions causing data races | Medium | High |
| Client-side validation drift from server-side | Low | Medium |

## Mitigation

- **SQLite case-sensitivity**: Filter in JavaScript after query (implemented — slight perf trade-off acceptable for internal tool scale)
- **Prisma adapter**: Pin exact versions; use `@prisma/adapter-better-sqlite3` (validated working)
- **Concurrency**: Optimistic locking via status-in-WHERE-clause pattern on updateMany; return 409 on conflict
- **Validation drift**: Share priority enum values; property tests validate both layers
