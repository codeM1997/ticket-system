import type { NextFunction, Request, Response } from "express";

/**
 * Represents a client-facing error with an HTTP status code and one or
 * more field-level (or general) error messages.
 *
 * Example:
 *   throw new AppError(400, [{ field: "title", message: "Title is required" }]);
 */
export class AppError extends Error {
  public statusCode: number;
  public errors: Array<{ field?: string; message: string }>;

  constructor(statusCode: number, errors: Array<{ field?: string; message: string }>) {
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

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
