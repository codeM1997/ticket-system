# Requirements Document

## Introduction

Internal support ticket management application. Users create, update, comment on, search, and progress tickets through a defined lifecycle state machine. Built with React frontend, Node.js/Express backend, SQLite via Prisma.

## Glossary

- **System**: The support ticket management application (frontend + backend)
- **Backend**: Node.js + Express server handling API requests and business logic
- **Frontend**: React single-page application
- **Ticket**: A support request with title, description, priority, status, assignee, and creator
- **Comment**: A text message attached to a ticket by a user
- **User**: A seeded internal user with id, name, email, and role
- **State_Machine**: The defined set of valid ticket status transitions (Open → In Progress → Resolved → Closed; Open → Cancelled; In Progress → Cancelled)
- **Priority**: Ticket urgency level (e.g., Low, Medium, High, Critical)
- **Status**: Current lifecycle state of a ticket (Open, In Progress, Resolved, Closed, Cancelled)

## Requirements

### Requirement 1: Create a Ticket

**User Story:** As an internal user, I want to create a support ticket, so that I can track a new issue.

#### Acceptance Criteria

1. WHEN a user submits a valid ticket creation request, THE Backend SHALL create a new Ticket with status "Open" and persist it to the database
2. WHEN a user submits a ticket creation request with missing required fields (title, description, priority, createdBy), THE Backend SHALL reject the request with a 400 status code and descriptive error message
3. WHEN a ticket is successfully created, THE Frontend SHALL display the new ticket to the user
4. IF a ticket creation request fails validation, THEN THE Frontend SHALL display the specific validation error messages

### Requirement 2: List Tickets

**User Story:** As an internal user, I want to see all tickets in a list, so that I can get an overview of current support requests.

#### Acceptance Criteria

1. WHEN a user navigates to the ticket list view, THE Frontend SHALL display all tickets with their title, priority, status, and assignee
2. THE Backend SHALL return all tickets ordered by most recently updated first
3. WHEN the ticket list is empty, THE Frontend SHALL display an informative empty state message

### Requirement 3: View Ticket Details

**User Story:** As an internal user, I want to view full details of a ticket, so that I can understand the issue and its history.

#### Acceptance Criteria

1. WHEN a user selects a ticket from the list, THE Frontend SHALL display the full ticket details including title, description, priority, status, assignee, creator, timestamps, and associated comments
2. WHEN a user requests a ticket that does not exist, THE Backend SHALL return a 404 status code
3. IF the Backend returns a 404 for a ticket request, THEN THE Frontend SHALL display a "ticket not found" error message

### Requirement 4: Update Ticket Fields

**User Story:** As an internal user, I want to update ticket fields, so that I can correct or refine ticket information.

#### Acceptance Criteria

1. WHEN a user submits valid updates to a ticket's title, description, priority, or assignee, THE Backend SHALL persist the changes and update the "updatedAt" timestamp
2. WHEN a user submits an update with invalid or empty required fields, THE Backend SHALL reject the request with a 400 status code and descriptive error message
3. WHEN a ticket is successfully updated, THE Frontend SHALL reflect the updated values immediately
4. IF a ticket update fails, THEN THE Frontend SHALL display the error message returned by the Backend

### Requirement 5: Ticket Status Transitions

**User Story:** As an internal user, I want to progress a ticket through its lifecycle, so that I can track resolution progress.

#### Acceptance Criteria

1. WHEN a user requests a status transition from "Open" to "In Progress", THE Backend SHALL accept the transition and persist the new status
2. WHEN a user requests a status transition from "In Progress" to "Resolved", THE Backend SHALL accept the transition and persist the new status
3. WHEN a user requests a status transition from "Resolved" to "Closed", THE Backend SHALL accept the transition and persist the new status
4. WHEN a user requests a status transition from "Open" to "Cancelled", THE Backend SHALL accept the transition and persist the new status
5. WHEN a user requests a status transition from "In Progress" to "Cancelled", THE Backend SHALL accept the transition and persist the new status
6. WHEN a user requests an invalid status transition, THE Backend SHALL reject the request with a 400 status code and a message identifying the invalid transition
7. IF the Backend rejects a status transition, THEN THE Frontend SHALL display the rejection reason to the user
8. THE Frontend SHALL present only valid next-status options based on the ticket's current status

### Requirement 6: Add Comments

**User Story:** As an internal user, I want to add comments to a ticket, so that I can communicate updates or ask questions.

#### Acceptance Criteria

1. WHEN a user submits a comment with a valid message and createdBy field, THE Backend SHALL create the Comment associated with the specified ticket and persist it
2. WHEN a user submits a comment with an empty message, THE Backend SHALL reject the request with a 400 status code
3. WHEN a comment is successfully added, THE Frontend SHALL display the new comment in the ticket's comment list without requiring a full page reload
4. THE Frontend SHALL display comments in chronological order (oldest first)

### Requirement 7: Search and Filter Tickets

**User Story:** As an internal user, I want to search tickets by keyword and filter by status, so that I can find relevant tickets quickly.

#### Acceptance Criteria

1. WHEN a user provides a keyword search term, THE Backend SHALL return tickets where the title or description contains the search term (case-insensitive)
2. WHEN a user selects a status filter, THE Backend SHALL return only tickets matching that status
3. WHEN a user provides both a keyword and a status filter, THE Backend SHALL return tickets matching both criteria
4. WHEN no tickets match the search or filter criteria, THE Frontend SHALL display an informative "no results" message

### Requirement 8: Data Persistence

**User Story:** As an internal user, I want my data to survive application restarts, so that I do not lose ticket information.

#### Acceptance Criteria

1. THE System SHALL store all Ticket, Comment, and User data in a SQLite database via Prisma ORM
2. THE System SHALL include a database schema migration script that creates all required tables
3. THE System SHALL include a seed script that populates initial User data
4. WHEN the application restarts, THE System SHALL retain all previously persisted data

### Requirement 9: Input Validation

**User Story:** As an internal user, I want the system to reject invalid input, so that data integrity is maintained.

#### Acceptance Criteria

1. THE Backend SHALL validate all required fields on ticket creation (title, description, priority, createdBy)
2. THE Backend SHALL validate all required fields on comment creation (message, createdBy)
3. WHEN validation fails, THE Backend SHALL return a 400 status code with a JSON response listing all validation errors
4. THE Backend SHALL reject priority values that are not in the allowed set (Low, Medium, High, Critical)

### Requirement 10: Error States in UI

**User Story:** As an internal user, I want to see meaningful error messages, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN an API request fails due to a network error, THE Frontend SHALL display a generic connectivity error message
2. WHEN an API request returns a 4xx status, THE Frontend SHALL display the specific error message from the response body
3. WHEN an API request returns a 5xx status, THE Frontend SHALL display a generic server error message
4. THE Frontend SHALL display error messages in a visually distinct, accessible manner (minimum WCAG 2.1 AA contrast)

### Requirement 11: Project Setup and Documentation

**User Story:** As a developer, I want clear setup instructions, so that I can run the project from a clean clone.

#### Acceptance Criteria

1. THE System SHALL include a README with step-by-step setup instructions covering dependency installation, database setup, seed data loading, and application startup
2. THE System SHALL include an environment variable example file documenting all required configuration
3. THE System SHALL not commit secrets or database files to the repository
4. THE System SHALL include a .gitignore that excludes node_modules, .env, and SQLite database files

### Requirement 12: Integration Tests for State Machine

**User Story:** As a developer, I want integration tests proving state machine rules, so that I can verify valid transitions succeed and invalid transitions are rejected.

#### Acceptance Criteria

1. THE System SHALL include integration tests that verify each valid status transition (Open→In Progress, In Progress→Resolved, Resolved→Closed, Open→Cancelled, In Progress→Cancelled) succeeds with a 200 status code
2. THE System SHALL include integration tests that verify invalid status transitions (e.g., Open→Resolved, Closed→Open, Cancelled→Open) are rejected with a 400 status code
3. WHEN an integration test exercises a status transition, THE test SHALL create a ticket, perform the transition via the API, and assert both the response code and the persisted status

### Requirement 13: Frontend Client-Side Validation

**User Story:** As an internal user, I want the frontend to block submission of invalid forms, so that I get immediate feedback and avoid unnecessary server round-trips.

#### Acceptance Criteria

1. WHEN a user attempts to submit a ticket creation form with missing or empty required fields (title, description, priority, createdBy), THE Frontend SHALL block the API request and display field-level validation errors
2. WHEN a user attempts to submit a ticket update form with an empty required field or invalid priority, THE Frontend SHALL block the API request and display field-level validation errors
3. WHEN a user attempts to submit a comment with an empty or whitespace-only message, THE Frontend SHALL block the API request and display a validation error
4. THE Frontend SHALL disable the submit control while any client-side validation error is present
