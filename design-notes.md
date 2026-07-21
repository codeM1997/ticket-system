# Design Notes

## Architecture Overview

```
┌─────────────────────┐     HTTP/JSON     ┌─────────────────────┐     Prisma     ┌──────────┐
│   React SPA (Vite)  │ ───────────────── │  Express API Server │ ──────────────  │  SQLite  │
│   Port: 5173        │   /api proxy      │  Port: 3006         │                 │  dev.db  │
└─────────────────────┘                   └─────────────────────┘                 └──────────┘
```

- **Frontend**: React 19 + Vite + TypeScript + TanStack React Query + React Router
- **Backend**: Express 5 + TypeScript + Prisma 7 (with better-sqlite3 adapter)
- **Database**: SQLite (file-based, via `@prisma/adapter-better-sqlite3`)
- **Monorepo**: npm workspaces at root managing `client/` and `server/`

## Frontend Design

### Stack
- React 19 with functional components and hooks
- TanStack React Query v5 for server state management (caching, invalidation, refetching)
- React Router v7 for client-side routing
- Vite dev server with proxy to backend (`/api` → `localhost:3006`)

### Component Architecture
- `App.tsx` — Route definitions (`/`, `/tickets/new`, `/tickets/:id`)
- `TicketList.tsx` — Displays all tickets with title, priority, status, assignee
- `TicketDetail.tsx` — Full ticket view with comments and transition controls
- `TicketForm.tsx` — Create/edit form with client-side validation
- `CommentForm.tsx` — Add comment with message + user select
- `CommentList.tsx` — Chronological comment display
- `SearchFilter.tsx` — Keyword input + status dropdown driving list query
- `StatusBadge.tsx` — Color-coded status labels
- `TransitionButtons.tsx` — Shows only valid next-status options
- `ErrorMessage.tsx` — Accessible error display (role="alert", WCAG AA contrast)

### State Management
- Server state via React Query (useQuery/useMutation)
- Optimistic UI: Query invalidation on mutations refreshes data without full page reload
- No client-side global state needed beyond React Query cache

## Backend Design

### Stack
- Express 5 (native async error handling)
- TypeScript (strict mode)
- tsx for development (watch mode)
- Modular architecture: routes → validation → state machine → Prisma

### Layers
1. **Routes** (`server/src/routes/`) — HTTP endpoint handlers, delegates to services
2. **Validation** (`server/src/validation.ts`) — Pure functions returning error arrays
3. **State Machine** (`server/src/stateMachine.ts`) — Centralized transition rules
4. **Error Handling** (`server/src/errors.ts`) — AppError class + Express error middleware
5. **Data Access** (`server/src/prisma.ts`) — Prisma client singleton

### Key Design Decisions
- State machine isolated from routes for testability and reuse
- Validation returns ALL errors (not fail-fast) for better UX
- Optimistic locking on transitions (status in WHERE clause) prevents TOCTOU races
- App exported separately from server.listen() for testability with supertest

## Database Design

### Models
- **User** — id (UUID), name, email (unique), role (default: "agent")
- **Ticket** — id (UUID), title, description, priority, status (default: "Open"), createdAt, updatedAt, createdBy (FK→User), assignedTo (FK→User, nullable)
- **Comment** — id (UUID), message, createdAt, ticketId (FK→Ticket), createdBy (FK→User)

### Indexes
- `Ticket.updatedAt` — Efficient ordering for list endpoint
- `Ticket.status` — Efficient status filtering
- `Comment(ticketId, createdAt)` — Efficient comment retrieval per ticket

### Relationships
- User has many created tickets, many assigned tickets, many comments
- Ticket has many comments, belongs to creator, optionally belongs to assignee
- Comment belongs to ticket and author

## Validation Strategy

### Server-Side
- Pure validation functions (no side effects, easy to test)
- Returns `ValidationError[]` — array of `{ field, message }` objects
- Empty array = valid input
- Validates ALL fields and returns ALL errors simultaneously
- Priority restricted to enum: `["Low", "Medium", "High", "Critical"]`

### Client-Side
- Mirror of server validation logic in React components
- Blocks form submission while validation errors exist
- Disables submit button during validation errors
- Field-level error display next to each invalid input
- Falls back to server error display for edge cases

## Error Handling Strategy

### Error Response Format
```json
// 400 - Validation / Business Logic Error
{ "errors": [{ "field": "title", "message": "Title is required" }] }

// 404 - Not Found
{ "errors": [{ "field": "id", "message": "Ticket not found" }] }

// 409 - Conflict (concurrent modification)
{ "errors": [{ "field": "toStatus", "message": "Conflict: ticket status changed concurrently" }] }

// 500 - Internal Server Error
{ "error": "Internal server error" }
```

### Error Middleware Chain
1. `AppError` instances → respond with `statusCode` and `{ errors }` array
2. Prisma P2025 (record not found) → 404
3. Prisma P2003 (FK constraint) → 400
4. Unknown errors → log + 500 generic message

### Frontend Error Handling
- Network errors → "Unable to connect to server"
- 4xx → Display specific field/message from response
- 5xx → "Something went wrong. Please try again later."
- `role="alert"` for screen reader accessibility

## Testing Strategy Link

See [test-strategy.md](./test-strategy.md) for the full testing approach.
