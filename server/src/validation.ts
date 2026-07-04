export type ValidationError = { field: string; message: string };

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as readonly string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Shape expected for POST /api/tickets requests.
 */
export interface TicketCreateInput {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  createdBy?: unknown;
}

/**
 * Validates a ticket creation payload.
 * Returns an empty array when the payload is valid.
 */
export function validateTicketCreate(input: TicketCreateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isNonEmptyString(input.title)) {
    errors.push({ field: "title", message: "Title is required" });
  }

  if (!isNonEmptyString(input.description)) {
    errors.push({ field: "description", message: "Description is required" });
  }

  if (input.priority === undefined || input.priority === null || input.priority === "") {
    errors.push({ field: "priority", message: "Priority is required" });
  } else if (!isPriority(input.priority)) {
    errors.push({
      field: "priority",
      message: `Priority must be one of: ${PRIORITIES.join(", ")}`,
    });
  }

  if (!isNonEmptyString(input.createdBy)) {
    errors.push({ field: "createdBy", message: "createdBy is required" });
  }

  return errors;
}

/**
 * Shape expected for PATCH /api/tickets/:id requests.
 * All fields optional; at least one must be provided.
 */
export interface TicketUpdateInput {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  assignedTo?: unknown;
}

/**
 * Validates a partial ticket update payload.
 * Requires at least one recognized field to be present, and any present
 * field to individually be valid.
 */
export function validateTicketUpdate(input: TicketUpdateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  const hasTitle = Object.prototype.hasOwnProperty.call(input, "title");
  const hasDescription = Object.prototype.hasOwnProperty.call(input, "description");
  const hasPriority = Object.prototype.hasOwnProperty.call(input, "priority");
  const hasAssignedTo = Object.prototype.hasOwnProperty.call(input, "assignedTo");

  if (!hasTitle && !hasDescription && !hasPriority && !hasAssignedTo) {
    errors.push({ field: "_", message: "At least one field must be provided" });
    return errors;
  }

  if (hasTitle && !isNonEmptyString(input.title)) {
    errors.push({ field: "title", message: "Title must not be empty" });
  }

  if (hasDescription && !isNonEmptyString(input.description)) {
    errors.push({ field: "description", message: "Description must not be empty" });
  }

  if (hasPriority && !isPriority(input.priority)) {
    errors.push({
      field: "priority",
      message: `Priority must be one of: ${PRIORITIES.join(", ")}`,
    });
  }

  if (hasAssignedTo && input.assignedTo !== null && !isNonEmptyString(input.assignedTo)) {
    errors.push({ field: "assignedTo", message: "assignedTo must be a valid user id or null" });
  }

  return errors;
}

/**
 * Shape expected for POST /api/tickets/:id/comments requests.
 */
export interface CommentCreateInput {
  message?: unknown;
  createdBy?: unknown;
}

/**
 * Validates a comment creation payload.
 */
export function validateCommentCreate(input: CommentCreateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isNonEmptyString(input.message)) {
    errors.push({ field: "message", message: "Message is required" });
  }

  if (!isNonEmptyString(input.createdBy)) {
    errors.push({ field: "createdBy", message: "createdBy is required" });
  }

  return errors;
}

/**
 * Shape expected for POST /api/tickets/:id/transitions requests.
 */
export interface TransitionInput {
  toStatus?: unknown;
}

/**
 * Validates a status transition payload's shape.
 * Does not check whether the transition itself is allowed by the state
 * machine — that check happens separately via `canTransition`.
 */
export function validateTransition(input: TransitionInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isNonEmptyString(input.toStatus)) {
    errors.push({ field: "toStatus", message: "toStatus is required" });
  }

  return errors;
}
