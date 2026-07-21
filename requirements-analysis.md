# Requirement Analysis

## Selected Project Option

Internal Support Ticket Management System

## My Understanding (in your own words)

Build a full-stack internal support ticket management application where users can create, update, search, and progress tickets through a defined lifecycle state machine. The system includes a React SPA frontend communicating with a Node.js/Express REST API backend, persisting data in SQLite via Prisma ORM. Users are pre-seeded (no authentication); the focus is on ticket CRUD, state machine enforcement, commenting, search/filtering, input validation, and comprehensive error handling.

## Functional Requirements

1. **Ticket CRUD** — Create tickets (always start "Open"), list all tickets (ordered by most recently updated), view full ticket details with comments, and update ticket fields (title, description, priority, assignee).
2. **State Machine Transitions** — Tickets progress through a defined lifecycle: Open → In Progress → Resolved → Closed, with cancellation paths from Open and In Progress. Invalid transitions are rejected with descriptive errors.
3. **Comments** — Users can add comments to tickets. Comments are displayed chronologically (oldest first). Empty messages are rejected.
4. **Search & Filter** — Keyword search (case-insensitive substring match on title/description) and status filter, combinable.
5. **User Management** — Pre-seeded users (no auth). Users selectable via dropdown in forms.
6. **Input Validation** — Server-side validation for all endpoints returning structured `{ errors: [{ field, message }] }` responses. Client-side validation blocking form submission with field-level errors.
7. **Error Handling** — Network errors, 4xx, and 5xx responses surfaced to users with appropriate messaging. WCAG 2.1 AA compliant error display.

## Non-Functional Requirements

1. **Data Persistence** — SQLite via Prisma ORM; data survives application restarts.
2. **Developer Experience** — Monorepo with npm workspaces, clear README, `.env.example`, `.gitignore`, idempotent seed script.
3. **Testability** — Integration tests proving state machine rules via HTTP (supertest). Property-based tests (fast-check) validating correctness properties. Unit tests for state machine logic.
4. **Accessibility** — Error messages meet WCAG 2.1 AA contrast requirements.
5. **Performance** — Database indexes on `updatedAt` and `status` for efficient ticket queries.
6. **Concurrency Safety** — TOCTOU protection on status transitions using optimistic locking pattern (status in WHERE clause).

## Assumptions

- No authentication/authorization required — all seeded users have equal access.
- Single-tenant, single-instance deployment (SQLite is appropriate).
- Users are pre-populated via seed script; no user registration flow.
- The application runs locally for development/demo purposes.
- Browser support: modern evergreen browsers only.
- No file attachments or rich text in tickets/comments.
- No real-time updates (polling via React Query's stale-time is sufficient).

## Clarifications (questions for a product owner)

1. Should there be role-based access control (e.g., only admins can close tickets)?
2. Is there a maximum length for ticket title/description/comments?
3. Should ticket deletion be supported, or only status-based lifecycle management?
4. Are email notifications needed when a ticket is assigned or transitioned?
5. Should the search support pagination for large ticket volumes?
6. Is there a requirement for audit logging (who changed what, when)?

## Edge Cases

1. **Concurrent status transitions** — Two users try to transition the same ticket simultaneously. Handled via optimistic locking (status in WHERE clause returns count=0 → 409 Conflict).
2. **Ticket referenced by comment deleted mid-request** — Prisma foreign key constraint (P2003) caught by error middleware → 400.
3. **Empty search/filter** — Returns all tickets (no filter applied).
4. **Whitespace-only input** — Trimmed and treated as empty → validation error.
5. **Non-existent user ID in createdBy/assignedTo** — Foreign key constraint enforced by Prisma; caught gracefully.
6. **Invalid UUID format for ticket ID** — Prisma returns null on findUnique → 404 response.
7. **Prototype pollution on status lookup** — State machine uses `Object.hasOwn()` to prevent inherited property access (e.g., "toString", "hasOwnProperty").
