import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateTicketCreate, PRIORITIES } from "../../src/validation.js";

// Feature: support-ticket-management, Property 16: Invalid priority values are rejected
//
// Validates Requirements 9.4.
//
// For any string not in {Low, Medium, High, Critical}, submitting it as
// priority on ticket creation shall produce a validation error.
//
// Scope: validation-layer property. The HTTP-level 400 response is exercised
// once the POST /api/tickets route is implemented (task 8.1).

describe("Property 16: Invalid priority values are rejected", () => {
  it("any priority string outside the enum yields a priority validation error", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !(PRIORITIES as readonly string[]).includes(s)),
        (invalidPriority) => {
          const errors = validateTicketCreate({
            title: "Valid title",
            description: "Valid description",
            priority: invalidPriority,
            createdBy: "user-1",
          });

          const priorityErrors = errors.filter((e) => e.field === "priority");
          expect(priorityErrors.length).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("every value in the priority enum is accepted (no priority error)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PRIORITIES), (priority) => {
        const errors = validateTicketCreate({
          title: "Valid title",
          description: "Valid description",
          priority,
          createdBy: "user-1",
        });

        expect(errors.some((e) => e.field === "priority")).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
