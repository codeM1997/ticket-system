# Reflection

## What I Built

An internal support ticket management system with a React frontend, Express REST API backend, and SQLite database. The system supports full ticket CRUD, a state machine for lifecycle transitions (Open → In Progress → Resolved → Closed, with cancellation paths), commenting, and keyword search/filter. Comprehensive test coverage via unit, property-based, and integration tests.

## How I Used AI (across the lifecycle)

AI (Kiro) was used across every phase of the software development lifecycle:

- **Requirements**: Generated the BRD and structured requirements with acceptance criteria from high-level descriptions
- **Design**: Produced technical design documents including architecture diagrams, API contracts, data models, and correctness properties
- **Task Generation**: Broke down the design into an ordered implementation plan with requirement traceability
- **Development**: Generated boilerplate code, routes, components, validation logic, and state machine implementation
- **Debugging**: Assisted with diagnosing runtime errors, Prisma adapter issues, and test failures
- **Testing**: Produced unit tests, property-based tests (fast-check), and integration tests from correctness properties
- **Documentation**: Generated README, inline code comments, and submission artifacts

## What AI Helped With Most

- **Documentation**: Generating structured, comprehensive docs (README, design notes, API contracts) from code context
- **Code Standardization**: Consistent error handling patterns, validation structure, and response formats across all endpoints
- **Debugging**: Quick diagnosis of Prisma/SQLite adapter issues and test configuration problems
- **Development**: Rapid scaffolding of repetitive patterns (CRUD routes, React Query hooks, form components)

## What AI Got Wrong

- **Node.js version**: Consistently used the wrong Node.js version and had to be corrected each time. Despite `.nvmrc` being present, AI would default to different versions or suggest incompatible package versions.

## How I Validated AI Output

- Ran the full test suite (`npm test`) after each significant change
- Manual testing of all UI workflows (create, list, detail, update, transition, comment, search/filter)
- Reviewed generated code for correctness, edge cases, and security concerns
- Verified database state after operations using Prisma Studio
- Cross-referenced implementation against requirements and acceptance criteria

## What I Would Improve Next

- Improve steering files and skills configuration to generate better quality code out of the gate
- Add more specific constraints around Node.js version and package compatibility in steering rules
- Create project-specific steering that captures architectural decisions to avoid drift

## Reusable Workflow (prompts, rules, specs, templates)

- `/caveman-review` or `/code-reviews` — Custom skill for automated code reviews that checks for common issues, security concerns, and adherence to project conventions
- Spec-driven development workflow: requirements.md → design.md → tasks.md → implementation (Kiro's built-in spec feature)
- Property-based test generation from correctness properties defined in design documents
