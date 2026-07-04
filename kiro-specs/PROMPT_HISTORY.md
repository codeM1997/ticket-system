# Prompt History

This file records every user prompt submitted during spec-driven development of the Support Ticket Management System, along with any changes made to the generated output. It demonstrates that Kiro was used as a spec-driven tool — not just a code generator.

---

## Prompt 1 — Initial Project Spec Request

**Date:** 2026-07-04

**Prompt (summarised):**
> Build a Support Ticket Management System. Tech stack: React, Node.js + Express, SQLite via Prisma. Models: User (id, name, email, role), Ticket (id, title, description, priority, status, assignedTo, createdBy, createdAt, updatedAt), Comment (id, ticketId, message, createdBy, createdAt). State machine: Open→In Progress, In Progress→Resolved, Resolved→Closed, Open→Cancelled, In Progress→Cancelled. Invalid transitions rejected by backend, handled in frontend. Features: create/list/view/update tickets, status transitions, comments, keyword search + status filter, data persistence, input validation, meaningful error states in UI. Out of scope: auth, user management UI. Additional: README from clean clone, integration tests for state machine, no secrets committed, DB setup docs, prompt history file, submit to kiro-specs/ folder.

**Kiro output:**
- Generated `requirements.md` with 12 requirements covering all features, EARS-style acceptance criteria.

**User review & changes:** None — requirements accepted as-is, proceeded to design phase.

---

## Prompt 2 — Proceed to Design Phase

**Date:** 2026-07-04

**Prompt:**
> I have read the requirements. Lets proceed to the design phase.

**Kiro output:**
- Generated `design.md` with architecture diagram, API endpoint table, request/response shapes, state machine module, Prisma schema, project directory structure, 16 correctness properties, error handling strategy, and testing strategy (unit + PBT + integration).

**User review & changes:** Proceeded after review — model field corrections applied in Prompt 3.

---

## Prompt 3 — Correct Model Field Definitions

**Date:** 2026-07-04

**Prompt:**
> User is to have only id, name, email and role. Ticket has to have only id, title, description, priority, status, assignedTo, createdBy, createdAt, updatedAt. Comment has to have only id, ticketId, message, createdBy, createdAt. Please update.

**Reason for change:** Generated design added `createdAt` to User (not in spec) and used `assignee` as the Prisma field name instead of the specified `assignedTo`.

**Changes made to design.md:**
- Removed `createdAt` from `User` model in Prisma schema.
- Renamed Prisma field `assignee String?` to `assignedTo String?` on `Ticket` model.
- Updated all API response shape examples to use `assignedTo` instead of `assignee`.
- Updated Property 5 description to reference `assignedTo`.

---

## Prompt 4 — Add Frontend Validation Property

**Date:** 2026-07-04

**Prompt:**
> In Correctness Properties, add that frontend will not allow to hit the backend if there are validation errors on frontend.

**Reason for change:** The original spec covered backend validation but had no explicit correctness property or requirement for client-side validation blocking API calls.

**Changes made:**
- Added **Property 17** to `design.md`: "Frontend blocks API calls when client-side validation fails" — covers ticket create, ticket update, and comment create forms.
- Added **Requirement 13** to `requirements.md`: "Frontend Client-Side Validation" with 4 acceptance criteria covering form blocking, field-level error display, and submit button disabling.

---

## Prompt 5 — Proceed to Tasks Phase

**Date:** 2026-07-04

**Prompt (implicit):** User confirmed design was ready; Kiro proceeded to generate `tasks.md`.

**Kiro output:**
- Generated `tasks.md` with 22 top-level tasks, bottom-up ordering (scaffold → DB → state machine → backend routes → integration tests → frontend → docs), optional PBT sub-tasks marked `*`, full requirement traceability on each task.

**User review & changes:** Accepted as-is.

---

## Prompt 6 — Initialise Git Repo and Commit

**Date:** 2026-07-04

**Prompt:**
> Initialise the git repo and commit the current changes.

**Actions taken:**
- `git init`, renamed branch to `main`.
- Created `.gitignore` excluding `node_modules/`, `.env`, `*.db`, `*.sqlite`, `dist/`, `build/`, `coverage/`.
- Staged and committed all spec and project config files: `chore: initialise repo with spec documents and project config`.

---

## Prompt 7 — Push to GitHub

**Date:** 2026-07-04

**Prompt:**
> Now git push, I want to push to https://github.com/. I will provide the credentials as required.

**Remote URL provided:** `https://github.com/codeM1997/ticket-system.git`

**Actions taken:**
- Added remote origin.
- Push requires interactive credential input (GitHub PAT); user must run `git push -u origin main` manually.

---

## Prompt 8 — Create kiro-specs/ Folder with Artifacts and Prompt History

**Date:** 2026-07-04

**Prompt:**
> I have to submit tool-specific/kiro-specs/ with requirements.md, design.md, tasks.md. I have to show that I reviewed and improved the generated spec, that my implementation followed it, that I updated it when needed, and that I used Kiro as a spec-driven tool rather than only a code generator. You haven't created this folder with the required artifacts. Also, you haven't created a prompt history of up till now. Create prompt history in the above folder as well.

**Actions taken:**
- Created `kiro-specs/` directory.
- Copied `requirements.md`, `design.md`, `tasks.md` from `.kiro/specs/support-ticket-management/` into `kiro-specs/`.
- Created this `PROMPT_HISTORY.md` documenting all prior prompts and spec changes.

---

## Prompt 9 — Automate Prompt History Updates

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked how prompt history would be maintained after every prompt, wanting to ensure it stays current automatically rather than requiring manual updates.

**Kiro output:**
- Created an `agentStop` hook (`update-prompt-history`) that fires after every agent turn and instructs the agent to append a new entry to `kiro-specs/PROMPT_HISTORY.md` if the prompt was meaningful.

**User review & changes:** None — accepted as-is.

---

## Prompt 10 — Commit Current Changes

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked to commit all current uncommitted changes to the git repo.

**Kiro output:**
- Staged `kiro-specs/` and `.kiro/hooks/` directories.
- Committed with message `chore: add kiro-specs artifacts, prompt history, and agentStop hook`.

**User review & changes:** None — accepted as-is.

---

## Prompt 11 — Git Push

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked to push committed changes to GitHub remote.

**Kiro output:**
- Could not push interactively (terminal requires GitHub PAT input). Instructed user to run `git push` manually in their terminal.

**User review & changes:** None.

---

## Prompt 12 — Execute Task 1: Bootstrap Monorepo

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked to execute task 1 from the spec tasks.md — "Bootstrap monorepo and prompt history". Task required creating `client/` and `server/` directories, a root `package.json` with npm workspaces and delegating `dev`/`build`/`test` scripts, and a `PROMPT_HISTORY.md` at repo root for spec-driven development record.

**Kiro output:**
- Created root `package.json` with npm workspaces pointing to `client` and `server`; top-level `dev`, `build`, `test` scripts delegate to each workspace.
- Created `client/package.json` stub.
- Created `server/package.json` stub.
- Created `PROMPT_HISTORY.md` at repo root with initial entries documenting the spec creation session and this bootstrap session.
- Marked task 1 as completed in `tasks.md`.

**User review & changes:** None — accepted as-is.

---

## Prompt 13 — Remove Redundant Root PROMPT_HISTORY.md

**Date:** 2026-07-04

**Prompt (summarised):**
> User pointed out that maintaining a `PROMPT_HISTORY.md` at repo root is redundant since `kiro-specs/PROMPT_HISTORY.md` already serves that purpose. Asked to remove the root-level file.

**Kiro output:**
- Deleted `PROMPT_HISTORY.md` from repo root.

**User review & changes:** None — accepted as-is.

---

## Prompt 14 — Commit Current Changes

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked to commit all current uncommitted changes to the git repo.

**Kiro output:**
- Staged `client/`, `server/`, `package.json`, updated `tasks.md`, and `kiro-specs/PROMPT_HISTORY.md`.
- Committed with message `chore: bootstrap monorepo, remove redundant root PROMPT_HISTORY, update tasks and prompt log`.

**User review & changes:** None — accepted as-is.

---

## Prompt 15 — Fix Stuck npm install by Pinning Node Version

**Date:** 2026-07-04

**Prompt (summarised):**
> User reported `npm install` in `server/` appeared stuck and asked to switch to Node v20.11.1 via `nvm use`, pin that version in `package.json`, and update the README accordingly.

**Kiro output:**
- Killed the stuck background `npm install` process.
- Discovered Node v20.11.1 is incompatible with pinned `prisma`/`@prisma/client` 7.8.0 (requires Node 20.19+, 22.12+, or 24+); flagged this to the user.
- User chose to use Node v20.19.0 instead (closest compatible LTS) rather than downgrading Prisma.
- Installed Node v20.19.0 via `nvm install`/`nvm use`.
- Added `.nvmrc` (root and `server/`) pinning `20.19.0`.
- Added `engines.node: "20.19.0"` to `server/package.json`.
- Created root `README.md` with a Prerequisites section documenting the required Node version and `nvm use` setup step.
- Re-ran `npm install` in `server/` successfully under Node v20.19.0.

**User review & changes:** User asked for v20.11.1; Kiro substituted v20.19.0 due to a hard Prisma engine requirement, confirmed with user before proceeding.


---

## Prompt 16 — Execute Task 2: Set Up Backend Project Skeleton

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked to execute task 2 from the spec tasks.md — "Set up backend project skeleton". Task required initializing `server/` with `package.json`, `tsconfig.json`, TypeScript, Express, Prisma, vitest, supertest, fast-check, cors, dotenv; creating `server/src/index.ts` with Express app, JSON middleware, CORS, `/api` router mount, and error middleware placeholder; and npm scripts `dev`/`build`/`start`/`test`/`prisma:migrate`/`prisma:seed`.

**Kiro output:**
- Verified `server/package.json` already had all required deps (express, cors, dotenv, @prisma/client, typescript, tsx, prisma, vitest, supertest, fast-check) and all required scripts.
- Verified `server/tsconfig.json` correctly configured (NodeNext, strict, outDir/rootDir set).
- Verified `server/src/index.ts` already implements Express app with JSON middleware, CORS, `/api` router mount, and error middleware placeholder.
- Confirmed dependencies installed (hoisted to root `node_modules` via npm workspaces).
- Ran `npm run build --workspace=server` — passed cleanly with no errors.
- Marked task 2 as completed in `tasks.md`.

**User review & changes:** None — skeleton was already in place from prior work and matched spec exactly; accepted as-is.


---

## Prompt 17 — Create .env File with Custom Port

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked to create a `.env` file for the server, setting `PORT` to 3006.

**Kiro output:**
- Verified `.env` already excluded via root `.gitignore`.
- Created `server/.env` with `PORT=3006` and `DATABASE_URL="file:./dev.db"` (needed ahead of Prisma setup in task 3).

**User review & changes:** None — accepted as-is.


---

## Prompt 18 — Create Pr-review Skill

**Date:** 2026-07-04

**Prompt (summarised):**
> User asked to create a new skill named "Pr-review" (`reviewing-code`) for performing thorough code reviews focused on correctness, maintainability, performance, and best practices, with a defined steps process and severity-based feedback format.

**Kiro output:**
- Created `.kiro/skills/pr-review/SKILL.md` with frontmatter (`name: reviewing-code`, description) and a 7-step review process: understand the change, check correctness, check maintainability, check performance, check type safety, check testing, provide severity-tiered feedback (must fix/should fix/nit).

**User review & changes:** None — accepted as-is.


---

## Prompt 19 — Review Server Code

**Date:** 2026-07-04

**Prompt (summarised):**
> User invoked the `/reviewing-code` skill to review the server code.

**Kiro output:**
- Reviewed `server/src/index.ts` (only real source file at this stage) against correctness, maintainability, performance, type safety, and testing criteria.
- Findings: CORS has no origin restriction (risk, acceptable for local dev, flagged for pre-deploy lockdown); `port` variable mixes string/number types (nit); error middleware placeholder confirmed intentional per task 6 comment.

**User review & changes:** None — findings presented as review feedback only, no code changes requested.
