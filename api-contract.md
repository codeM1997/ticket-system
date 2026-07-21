# API Contract

## Base URL

`http://localhost:3006/api`

---

## Endpoint: Create Ticket

**Method:** POST  
**Path:** `/api/tickets`  
**Purpose:** Create a new support ticket (always starts with status "Open")

### Request
```json
{
  "title": "string (required, non-empty)",
  "description": "string (required, non-empty)",
  "priority": "Low | Medium | High | Critical (required)",
  "createdBy": "string (required, valid user UUID)",
  "assignedTo": "string (optional, valid user UUID or null)"
}
```

### Response
```json
// 201 Created
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "string",
  "status": "Open",
  "createdBy": "uuid",
  "assignedTo": null,
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Validation Rules
- `title`: must be a non-empty string (after trim)
- `description`: must be a non-empty string (after trim)
- `priority`: must be one of: Low, Medium, High, Critical
- `createdBy`: must be a non-empty string (FK enforced by database)

### Error Responses
```json
// 400 Bad Request — validation failure
{
  "errors": [
    { "field": "title", "message": "Title is required" },
    { "field": "priority", "message": "Priority must be one of: Low, Medium, High, Critical" }
  ]
}
```

---

## Endpoint: List Tickets

**Method:** GET  
**Path:** `/api/tickets`  
**Purpose:** Retrieve all tickets with optional search and status filter

### Request
Query parameters:
- `search` (optional): case-insensitive substring match against title OR description
- `status` (optional): exact match filter (Open, In Progress, Resolved, Closed, Cancelled)

### Response
```json
// 200 OK
{
  "tickets": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "priority": "string",
      "status": "string",
      "createdBy": "uuid",
      "assignedTo": "uuid | null",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

### Validation Rules
- No required parameters
- Results ordered by `updatedAt` descending (most recently updated first)
- When both `search` and `status` are provided, both criteria must match

### Error Responses
```json
// 500 Internal Server Error
{ "error": "Internal server error" }
```

---

## Endpoint: Get Ticket Details

**Method:** GET  
**Path:** `/api/tickets/:id`  
**Purpose:** Retrieve full ticket details including associated comments

### Request
Path parameter:
- `id`: UUID of the ticket

### Response
```json
// 200 OK
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "string",
  "status": "string",
  "createdBy": "uuid",
  "assignedTo": "uuid | null",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "comments": [
    {
      "id": "uuid",
      "message": "string",
      "createdBy": "uuid",
      "createdAt": "ISO 8601 datetime",
      "ticketId": "uuid"
    }
  ]
}
```

### Validation Rules
- `id` must be a valid ticket UUID
- Comments returned in chronological order (oldest first, by `createdAt` asc)

### Error Responses
```json
// 404 Not Found
{ "errors": [{ "field": "id", "message": "Ticket not found" }] }
```

---

## Endpoint: Update Ticket

**Method:** PATCH  
**Path:** `/api/tickets/:id`  
**Purpose:** Partially update ticket fields (title, description, priority, assignedTo)

### Request
```json
{
  "title": "string (optional, non-empty if provided)",
  "description": "string (optional, non-empty if provided)",
  "priority": "Low | Medium | High | Critical (optional)",
  "assignedTo": "string | null (optional)"
}
```

### Response
```json
// 200 OK — full updated ticket object
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "string",
  "status": "string",
  "createdBy": "uuid",
  "assignedTo": "uuid | null",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Validation Rules
- At least one recognized field must be provided
- `title`: if provided, must be non-empty string
- `description`: if provided, must be non-empty string
- `priority`: if provided, must be one of: Low, Medium, High, Critical
- `assignedTo`: if provided, must be a valid user id string or null

### Error Responses
```json
// 400 Bad Request
{ "errors": [{ "field": "_", "message": "At least one field must be provided" }] }

// 400 Bad Request
{ "errors": [{ "field": "title", "message": "Title must not be empty" }] }

// 404 Not Found (via Prisma P2025)
{ "errors": [{ "field": "id", "message": "Not found" }] }
```

---

## Endpoint: Transition Ticket Status

**Method:** POST  
**Path:** `/api/tickets/:id/transitions`  
**Purpose:** Transition a ticket's status through the state machine

### Request
```json
{
  "toStatus": "In Progress | Resolved | Closed | Cancelled"
}
```

### Response
```json
// 200 OK — full updated ticket object
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "string",
  "status": "string (new status)",
  "createdBy": "uuid",
  "assignedTo": "uuid | null",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Validation Rules
- `toStatus`: must be a non-empty string
- Transition must be valid per state machine:
  - Open → In Progress, Cancelled
  - In Progress → Resolved, Cancelled
  - Resolved → Closed
  - Closed → (terminal, no transitions)
  - Cancelled → (terminal, no transitions)

### Error Responses
```json
// 400 Bad Request — invalid transition
{ "errors": [{ "field": "toStatus", "message": "Invalid transition from Open to Resolved" }] }

// 400 Bad Request — missing toStatus
{ "errors": [{ "field": "toStatus", "message": "toStatus is required" }] }

// 404 Not Found
{ "errors": [{ "field": "id", "message": "Ticket not found" }] }

// 409 Conflict — concurrent modification
{ "errors": [{ "field": "toStatus", "message": "Conflict: ticket status changed concurrently" }] }
```

---

## Endpoint: Add Comment

**Method:** POST  
**Path:** `/api/tickets/:id/comments`  
**Purpose:** Add a comment to an existing ticket

### Request
```json
{
  "message": "string (required, non-empty after trim)",
  "createdBy": "string (required, valid user UUID)"
}
```

### Response
```json
// 201 Created
{
  "id": "uuid",
  "message": "string",
  "createdBy": "uuid",
  "createdAt": "ISO 8601 datetime",
  "ticketId": "uuid"
}
```

### Validation Rules
- `message`: must be a non-empty string (after trim)
- `createdBy`: must be a non-empty string and a valid existing user ID

### Error Responses
```json
// 400 Bad Request — validation failure
{ "errors": [{ "field": "message", "message": "Message is required" }] }

// 400 Bad Request — invalid user
{ "errors": [{ "field": "createdBy", "message": "createdBy must be a valid user id" }] }

// 404 Not Found — ticket doesn't exist
{ "errors": [{ "field": "id", "message": "Ticket not found" }] }
```

---

## Endpoint: List Users

**Method:** GET  
**Path:** `/api/users`  
**Purpose:** Retrieve all seeded users for dropdown selection in forms

### Request
No parameters.

### Response
```json
// 200 OK
{
  "users": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  ]
}
```

### Validation Rules
- None (read-only endpoint)

### Error Responses
```json
// 500 Internal Server Error
{ "error": "Internal server error" }
```
