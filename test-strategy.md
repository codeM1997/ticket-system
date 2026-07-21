# Test Strategy

## Test Scope

Comprehensive testing across three levels: unit, property-based, and integration. Server-side testing uses Vitest as the runner, fast-check for property-based tests, and supertest for HTTP integration tests. Client-side uses Vitest with React Testing Library and jsdom.

## Unit Tests

**Location:** `server/tests/unit/`

| Test File | Coverage |
|-----------|----------|
| `stateMachine.test.ts` | Table-driven tests over all (from, to) status pairs; verifies `canTransition` and `getValidTransitions` |

## Component Tests

**Location:** `client/` (via Vitest + React Testing Library)

- Form validation behavior (TicketForm, CommentForm)
- TransitionButtons renders only valid next-status options for each status
- ErrorMessage displays with proper accessibility attributes

## API / Integration Tests

**Location:** `server/tests/integration/`

| Test File | Coverage |
|-----------|----------|
| `stateMachine.integration.test.ts` | Full HTTP round-trip tests for state machine |

### Integration Test Approach:
1. Create a ticket via `POST /api/tickets` using a seeded user
2. Drive ticket to desired `fromStatus` via sequential transitions
3. Attempt the transition under test via `POST /api/tickets/:id/transitions`
4. Assert HTTP status code (200 for valid, 400 for invalid)
5. Re-fetch ticket via `GET /api/tickets/:id` to verify persisted status

### Valid Transitions Tested:
- Open → In Progress (200)
- Open → Cancelled (200)
- In Progress → Resolved (200)
- In Progress → Cancelled (200)
- Resolved → Closed (200)

### Invalid Transitions Tested:
- Open → Resolved, Closed (400)
- In Progress → Open, Closed (400)
- Resolved → Open, In Progress, Cancelled (400)
- Closed → Open, In Progress, Resolved, Cancelled (400)
- Cancelled → Open, In Progress, Resolved, Closed (400)

## Property-Based Tests

**Location:** `server/tests/property/`  
**Framework:** fast-check

| Test File | Correctness Property |
|-----------|---------------------|
| `ticketCreation.property.test.ts` | Property 1: New tickets always start Open; Property 2: Missing required fields yield 400 |
| `ticketList.property.test.ts` | Property 3: List ordered by updatedAt desc; Property 13: Search/filter correctness |
| `stateMachine.property.test.ts` | Property 7: Valid transitions succeed |
| `stateMachine.invalidTransitions.property.test.ts` | Property 8: Invalid transitions rejected |
| `stateMachine.validTransitionSet.property.test.ts` | Property 9: getValidTransitions matches expected sets |
| `comment.property.test.ts` | Property 10: Valid comments persist; Property 11: Invalid comments yield 400; Property 12: Comments chronologically ordered |
| `validation.errorCollection.property.test.ts` | Property 15: All validation failures reported |
| `validation.invalidPriority.property.test.ts` | Property 16: Invalid priority values rejected |
| `persistence.roundTrip.property.test.ts` | Property 14: Data survives persistence round trip |

## Edge Case Tests

- Concurrent status transitions (409 Conflict via optimistic locking)
- Whitespace-only strings treated as empty (validation rejects)
- Non-existent ticket IDs return 404
- Non-existent user IDs in createdBy/assignedTo trigger FK constraint handling
- Prototype pollution protection in state machine (`Object.hasOwn` guard)
- All validation errors returned simultaneously (not fail-fast)

## Tests Not Covered (and why)

- **E2E browser tests (Playwright/Cypress)**: Scope limited to unit/integration/property for this assessment. Manual testing covers UI flows.
- **Load/performance tests**: Internal tool with low user count; SQLite with proper indexes is sufficient.
- **Authentication tests**: No auth implemented (pre-seeded users only).
- **Accessibility automated tests (axe-core)**: Manual WCAG verification performed; automated a11y testing would be a next step.
