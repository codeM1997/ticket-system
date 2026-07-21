# Acceptance Criteria

## Core

- [x] Users can create tickets with title, description, priority, and creator
- [x] New tickets always start with status "Open"
- [x] Users can view a list of all tickets ordered by most recently updated
- [x] Users can view full ticket details including comments
- [x] Users can update ticket fields (title, description, priority, assignee)
- [x] Users can transition tickets through valid state machine paths (Open→In Progress→Resolved→Closed, Open/In Progress→Cancelled)
- [x] Invalid state transitions are rejected with descriptive error messages
- [x] Users can add comments to tickets
- [x] Comments display in chronological order (oldest first)
- [x] Users can search tickets by keyword (case-insensitive, title/description)
- [x] Users can filter tickets by status
- [x] Search and filter can be combined
- [x] Pre-seeded users available for selection in forms

## Validation

- [x] Ticket creation validates: title (non-empty), description (non-empty), priority (enum), createdBy (non-empty)
- [x] Ticket update validates: at least one field provided, present fields individually valid
- [x] Comment creation validates: message (non-empty after trim), createdBy (non-empty)
- [x] Status transition validates: toStatus is a non-empty string
- [x] Priority restricted to enum: Low, Medium, High, Critical
- [x] Client-side validation blocks form submission and disables submit button
- [x] Field-level validation errors displayed next to invalid fields
- [x] All validation failures reported simultaneously (not just first)

## Error Handling

- [x] 400 responses return structured `{ errors: [{ field, message }] }` format
- [x] 404 returned for non-existent tickets
- [x] 409 returned for concurrent status transition conflicts (TOCTOU protection)
- [x] 500 errors return generic "Internal server error" (no leak of internals)
- [x] Frontend displays network errors with generic connectivity message
- [x] Frontend displays 4xx errors with specific messages from response body
- [x] Frontend displays 5xx errors with generic server error message
- [x] Error messages are visually distinct and WCAG 2.1 AA accessible

## Testing

- [x] Integration tests verify all 5 valid state transitions succeed (200)
- [x] Integration tests verify invalid transitions are rejected (400)
- [x] Integration tests create tickets via API, perform transitions, and assert both response and persisted status
- [x] Property-based tests validate correctness properties (ticket creation defaults, ordering, validation, search/filter, comment ordering, persistence)
- [x] Unit tests cover state machine logic with table-driven approach
- [x] Tests run via `npm test` at root (delegates to workspaces)

## Documentation

- [x] README with step-by-step setup from clean clone
- [x] `.env.example` documenting all required configuration
- [x] `.gitignore` excluding node_modules, .env, SQLite files, dist
- [x] No secrets or database files committed to repository
- [x] Prisma migration script creates all required tables
- [x] Seed script populates initial user data (idempotent via upsert)
