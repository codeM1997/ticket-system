import type { NextFunction, Request, Response } from "express";
import { Prisma } from "./generated/prisma/client.js";
import type { ValidationError } from "./validation.js";

/**
 * Represents a client-facing error with an HTTP status code and one or
 * more field-level error messages.
 *
 * The `errors` payload uses the same `ValidationError` shape emitted by
 * the validation module so response bodies have a single, guaranteed
 * `{ field, message }` contract for the frontend to bind against.
 *
 * Example:
 *   throw new AppError(400, [{ field: "title", message: "Title is required" }]);
 */
export class AppError extends Error {
  public statusCode: number;
  public errors: ValidationError[];

  constructor(statusCode: number, errors: ValidationError[]) {
    super(errors.map((e) => e.message).join(", "));
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Express error-handling middleware.
 *
 * - AppError instances: respond with `err.statusCode` and `{ errors: [...] }`.
 * - Prisma "record not found" (P2025): respond 404 with `{ errors: [...] }`,
 *   catching cases like PATCH/transition on a deleted or non-existent id.
 * - Any other error: log server-side and respond 500 with
 *   `{ error: "Internal server error" }`.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ errors: err.errors });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.status(404).json({ errors: [{ field: "id", message: "Not found" }] });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
