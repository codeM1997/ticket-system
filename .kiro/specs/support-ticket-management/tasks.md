# Implementation Plan: Support Ticket Management

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

## Overview

Bottom-up build: repo scaffold → database layer → state machine + validation → backend routes → integration tests → frontend types/API client → UI components with client-side validation → docs. Property tests live next to the code they validate. Optional sub-tasks (marked `*`) cover tests and MAY be skipped for a fast MVP.

## Tasks

- [x] 1. Bootstrap monorepo and prompt history
  - Create `client/` and `server/` directories at repo root
  - Add root `package.json` with workspace config or top-level scripts (`dev`, `build`, `test`) delegating to each package
  - Create `PROMPT_HISTORY.md` at repo root; append every user prompt and short summary of the AI response as spec-driven-development record
  - _Requirements: 11.1_

- [ ] 2. Set up backend project skeleton
  - Initialize `server/` with `package.json`, `tsconfig.json`, TypeScript, Express, Prisma, vitest, supertest, fast-check, cors, dotenv
  - Create `server/src/index.ts` with Express app, JSON middleware, CORS, `/api` router mount, and error middleware placeholder
  - Add npm scripts: `dev` (tsx watch), `build`, `start`, `test`, `prisma:migrate`, `prisma:seed`
  - _Requirements: 8.1_

- [ ] 3. Define Prisma schema and initial migration
  - Create `server/prisma/schema.prisma` with `User`, `Ticket`, `Comment` models exactly per design (fields, relations, defaults)
  - Configure SQLite datasource with `DATABASE_URL` from env
  - Run initial migration to generate SQLite DB and Prisma client
  - _Requirements: 8.1, 8.2_

- [ ] 4. Implement seed script
  - Create `server/prisma/seed.ts` inserting at least 3 seeded users with realistic name/email/role
  - Register seed command in `server/package.json` under `prisma.seed`
  - Verify seed runs idempotently (upsert on email)
  - _Requirements: 8.3_

- [ ] 5. Implement state machine module
  - [ ] 5.1 Create `server/src/stateMachine.ts` with `VALID_TRANSITIONS` map, `canTransition(from, to)`, `getValidTransitions(current)`
    - Include exact transitions from design: Open→[In Progress, Cancelled], In Progress→[Resolved, Cancelled], Resolved→[Closed], Closed→[], Cancelled→[]
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 5.2 Write unit tests for state machine (`server/tests/unit/stateMachine.test.ts`)
    - Table-driven tests over all (from, to) pairs
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 5.3 Write property test for valid transitions
    - **Property 7: Valid state machine transitions succeed**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [ ]* 5.4 Write property test for invalid transitions
    - **Property 8: Invalid state machine transitions are rejected**
    - **Validates: Requirements 5.6**

  - [ ]* 5.5 Write property test for valid-transition set exposure
    - **Property 9: Frontend presents only valid next-status options** (server-side portion — `getValidTransitions` output matches expected sets)
    - **Validates: Requirements 5.8**

- [ ] 6. Implement input validation and error handling
  - [ ] 6.1 Create `server/src/errors.ts` with `AppError` class and Express error middleware returning `{ errors: [...] }` for 400 and `{ error: "Internal server error" }` for 500
    - Wire middleware into `server/src/index.ts`
    - _Requirements: 9.3, 10.2, 10.3_

  - [ ] 6.2 Create `server/src/validation.ts` with pure functions: `validateTicketCreate`, `validateTicketUpdate`, `validateCommentCreate`, `validateTransition`
    - Each returns list of `{ field, message }` errors (empty = valid)
    - Enforce priority enum {Low, Medium, High, Critical}
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ]* 6.3 Write property test collecting all validation failures
    - **Property 15: Validation errors list all failures**
    - **Validates: Requirements 9.3**

  - [ ]* 6.4 Write property test for invalid priority rejection
    - **Property 16: Invalid priority values are rejected**
    - **Validates: Requirements 9.4**

- [ ] 7. Implement users route
  - Create `server/src/routes/users.ts` with `GET /api/users` returning all seeded users (id, name, email, role)
  - Mount router in `server/src/index.ts`
  - _Requirements: 8.3_

- [ ] 8. Implement ticket routes
  - [ ] 8.1 Implement `POST /api/tickets` in `server/src/routes/tickets.ts`
    - Validate payload; on success create ticket with `status: "Open"`; return 201 with full object
    - On validation failure return 400 via `AppError`
    - _Requirements: 1.1, 1.2, 9.1_

  - [ ]* 8.2 Write property test for ticket creation defaults
    - **Property 1: New tickets always start Open**
    - **Validates: Requirements 1.1**

  - [ ]* 8.3 Write property test for missing required fields
    - **Property 2: Missing required ticket fields yield 400**
    - **Validates: Requirements 1.2, 9.1**

  - [ ] 8.4 Implement `GET /api/tickets` with optional `search` and `status` query params
    - Return `{ tickets: [...] }` ordered by `updatedAt` descending
    - Case-insensitive substring match against `title` OR `description` when `search` present
    - Filter by exact `status` when provided; combine both criteria when both present
    - _Requirements: 2.1, 2.2, 7.1, 7.2, 7.3_

  - [ ]* 8.5 Write property test for list ordering
    - **Property 3: Ticket list is ordered by updatedAt descending**
    - **Validates: Requirements 2.2**

  - [ ]* 8.6 Write property test for search+filter correctness
    - **Property 13: Search and filter returns only matching tickets**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ] 8.7 Implement `GET /api/tickets/:id` returning ticket with comments ordered by `createdAt` ascending; 404 when not found
    - _Requirements: 3.1, 3.2, 6.4_

  - [ ]* 8.8 Write property test for not-found response
    - **Property 4: Non-existent ticket returns 404**
    - **Validates: Requirements 3.2**

  - [ ]* 8.9 Write property test for comment ordering
    - **Property 12: Comments are chronologically ordered**
    - **Validates: Requirements 6.4**

  - [ ] 8.10 Implement `PATCH /api/tickets/:id` accepting partial updates (title, description, priority, assignedTo)
    - Validate fields present; reject empty required strings and invalid priority with 400
    - Persist and let Prisma bump `updatedAt`; return full ticket
    - _Requirements: 4.1, 4.2_

  - [ ]* 8.11 Write property test for valid updates persistence
    - **Property 5: Valid ticket updates persist and bump updatedAt**
    - **Validates: Requirements 4.1**

  - [ ]* 8.12 Write property test for invalid updates rejection
    - **Property 6: Invalid ticket updates yield 400**
    - **Validates: Requirements 4.2**

  - [ ] 8.13 Implement `POST /api/tickets/:id/transitions`
    - Load ticket; if not found return 404
    - Validate `toStatus` string; call `canTransition(current, toStatus)`; if false return 400 with `Invalid transition from X to Y`
    - On valid transition persist new status and return updated ticket
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 9. Implement comment route
  - Create `POST /api/tickets/:id/comments` in `server/src/routes/comments.ts` (or under tickets router)
  - Validate `message` non-empty (trim whitespace) and `createdBy` present
  - Return 201 with created comment; 400 on validation failure; 404 if ticket missing
  - _Requirements: 6.1, 6.2, 9.2_

  - [ ]* 9.1 Write property test for valid comment creation
    - **Property 10: Valid comment creation persists**
    - **Validates: Requirements 6.1**

  - [ ]* 9.2 Write property test for invalid comment rejection
    - **Property 11: Invalid comment creation yields 400**
    - **Validates: Requirements 6.2, 9.2**

- [ ] 10. Integration tests for state machine over HTTP
  - [ ]* 10.1 Write supertest suite in `server/tests/integration/stateMachine.integration.test.ts`
    - For each valid pair {(Open, In Progress), (Open, Cancelled), (In Progress, Resolved), (In Progress, Cancelled), (Resolved, Closed)}: create ticket via API, drive to `fromStatus`, POST transition, assert 200 and re-fetch ticket to assert persisted status
    - For representative invalid pairs (Open→Resolved, Closed→Open, Cancelled→Open, Resolved→In Progress): create ticket, drive to `fromStatus`, POST transition, assert 400
    - Each test creates its own ticket; no shared state
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 10.2 Write property test for data persistence round trip
    - **Property 14: Data persistence round trip** (create via API, reconnect Prisma client, re-query, assert equal)
    - **Validates: Requirements 8.4**

- [ ] 11. Backend checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Set up frontend project skeleton
  - Initialize `client/` with Vite + React + TypeScript template
  - Add deps: `@tanstack/react-query`, `react-router-dom`, vitest, `@testing-library/react`, fast-check
  - Configure Vite dev proxy `/api` → `http://localhost:<server-port>`
  - Create `client/src/main.tsx` wiring `QueryClientProvider` and `BrowserRouter`
  - _Requirements: 11.1_

- [ ] 13. Define shared frontend types and API client
  - Create `client/src/types/index.ts` with `Ticket`, `Comment`, `User`, `Priority`, `Status`, request/response payload types matching backend
  - Create `client/src/api/tickets.ts` with fetch wrappers for every endpoint (list, get, create, update, transition, addComment, listUsers)
  - Centralize error parsing: throw typed error containing HTTP status and parsed body
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 14. Implement React Query hooks
  - Create `client/src/hooks/useTickets.ts` exposing `useTicketList(filters)`, `useTicket(id)`, `useCreateTicket`, `useUpdateTicket`, `useTransitionTicket`, `useAddComment`, `useUsers`
  - Invalidate list and detail queries on mutations so UI refreshes without reload
  - _Requirements: 1.3, 4.3, 6.3_

- [ ] 15. Implement shared UI components
  - [ ] 15.1 `ErrorMessage.tsx` with `role="alert"`, WCAG 2.1 AA compliant contrast, distinct visual styling
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 15.2 `StatusBadge.tsx` mapping each status to color-coded label
    - _Requirements: 2.1, 3.1_

- [ ] 16. Implement ticket list view
  - Create `TicketList.tsx` rendering title, priority, status, assignee for every ticket
  - Show empty-state message when list empty
  - Show "no results" message when filters applied and result set empty
  - Wire `SearchFilter.tsx` (keyword input + status dropdown) driving the list query
  - _Requirements: 2.1, 2.3, 7.4_

- [ ] 17. Implement ticket create/edit form
  - Create `TicketForm.tsx` used in both create and edit modes
  - Client-side validation: title/description non-empty, priority in enum, createdBy selected (from users dropdown)
  - Block submission and disable submit button while any validation error present
  - Display field-level error messages next to each invalid field
  - On successful create, navigate to and display the new ticket
  - Surface backend 4xx field errors on the corresponding fields
  - _Requirements: 1.3, 1.4, 4.3, 4.4, 13.1, 13.2, 13.4_

  - [ ]* 17.1 Write component tests asserting API not called when invalid
    - **Property 17: Frontend blocks API calls when client-side validation fails** (ticket create/update portion)
    - **Validates: Requirements 13.1, 13.2, 13.4**

- [ ] 18. Implement ticket detail view
  - Create `TicketDetail.tsx` displaying title, description, priority, status, assignee, creator, timestamps
  - Render `CommentList.tsx` in chronological order (oldest first)
  - Render `TransitionButtons.tsx` showing only `getValidTransitions(currentStatus)` options
  - On transition rejection from backend, surface the rejection message via `ErrorMessage`
  - Display "ticket not found" when API returns 404
  - _Requirements: 3.1, 3.3, 5.7, 5.8, 6.4_

  - [ ]* 18.1 Write component test for TransitionButtons options set
    - **Property 9: Frontend presents only valid next-status options** (client-side portion — rendered buttons match expected set for every status)
    - **Validates: Requirements 5.8**

- [ ] 19. Implement comment form
  - Create `CommentForm.tsx` with message textarea and createdBy user select
  - Client-side validation: message non-empty after trim, createdBy present
  - Disable submit while invalid; block API call and display error
  - On success, new comment appears in `CommentList` without page reload
  - _Requirements: 6.1, 6.3, 13.3, 13.4_

  - [ ]* 19.1 Write component test asserting API not called for empty/whitespace message
    - **Property 17: Frontend blocks API calls when client-side validation fails** (comment portion)
    - **Validates: Requirements 13.3, 13.4**

- [ ] 20. Wire application routes and shell
  - In `App.tsx`, define routes: `/` (list), `/tickets/new` (create), `/tickets/:id` (detail with edit + comments)
  - Global error boundary rendering `ErrorMessage` for network failures ("Unable to connect to server. Check your connection.") and 5xx ("Something went wrong. Please try again later.")
  - _Requirements: 10.1, 10.3_

- [ ] 21. Project documentation and hygiene
  - [ ] 21.1 Create `.gitignore` at repo root excluding `node_modules/`, `.env`, `.env.local`, `*.db`, `*.db-journal`, `dist/`, `build/`
    - _Requirements: 11.3, 11.4_

  - [ ] 21.2 Create `.env.example` at repo root and in `server/` documenting `DATABASE_URL`, `PORT`, and any client vars (`VITE_API_URL`)
    - _Requirements: 11.2, 11.3_

  - [ ] 21.3 Write `README.md` at repo root with step-by-step instructions from clean clone: install deps in root/client/server, copy `.env.example` to `.env`, run `prisma migrate dev`, run seed, start server, start client, run tests
    - _Requirements: 11.1_

  - [ ] 21.4 Append entry to `PROMPT_HISTORY.md` for each spec-driven prompt exchange completed during implementation
    - _Requirements: 11.1_

- [ ] 22. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Sub-tasks postfixed with `*` are optional (property, unit, and integration tests) and MAY be skipped for a faster MVP; core implementation tasks are never optional.
- Each task references specific requirements from `requirements.md` for traceability.
- Property tests are placed next to the implementation they validate to catch regressions early.
- Every one of the 17 correctness properties from `design.md` maps to a test task; Property 9 and Property 17 have both server- and client-side test tasks reflecting the split responsibility.
- The state machine integration suite (task 10.1) satisfies Requirement 12 in full.

## Next Step

This workflow is complete once `tasks.md` exists. Open `tasks.md` and click "Start task" next to any item to begin implementation.
