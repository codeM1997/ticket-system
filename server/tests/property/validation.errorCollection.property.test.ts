import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateTicketCreate, PRIORITIES } from "../../src/validation.js";

// Feature: support-ticket-management, Property 15: Validation errors list all failures
//
// Validates Requirements 9.3.
//
// For any ticket-create payload with multiple invalid fields, the returned
// error list must contain one entry per invalid field (not just the first).

const invalidStringArb = fc.constantFrom("", "   ", undefined, null);
const validStringArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
const validPriorityArb = fc.constantFrom(...PRIORITIES);
const invalidPriorityArb = fc
  .string()
  .filter((s) => !(PRIORITIES as readonly string[]).includes(s));

describe("Property 15: Validation errors list all failures", () => {
  it("reports every invalid field, not just the first, for arbitrary payloads", () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.oneof(validStringArb, invalidStringArb),
          description: fc.oneof(validStringArb, invalidStringArb),
          priority: fc.oneof(validPriorityArb, invalidPriorityArb, invalidStringArb),
          createdBy: fc.oneof(validStringArb, invalidStringArb),
        }),
        (payload) => {
          const errors = validateTicketCreate(payload);
          const fields = new Set(errors.map((e) => e.field));

          const titleInvalid = !(typeof payload.title === "string" && payload.title.trim());
          const descriptionInvalid = !(
            typeof payload.description === "string" && payload.description.trim()
          );
          const priorityInvalid = !(
            typeof payload.priority === "string" &&
            (PRIORITIES as readonly string[]).includes(payload.priority)
          );
          const createdByInvalid = !(
            typeof payload.createdBy === "string" && payload.createdBy.trim()
          );

          expect(fields.has("title")).toBe(titleInvalid);
          expect(fields.has("description")).toBe(descriptionInvalid);
          expect(fields.has("priority")).toBe(priorityInvalid);
          expect(fields.has("createdBy")).toBe(createdByInvalid);

          const expectedCount =
            Number(titleInvalid) +
            Number(descriptionInvalid) +
            Number(priorityInvalid) +
            Number(createdByInvalid);
          expect(errors).toHaveLength(expectedCount);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all-invalid payload yields exactly 4 errors, one per field", () => {
    const errors = validateTicketCreate({
      title: "",
      description: "   ",
      priority: "Urgent",
      createdBy: undefined,
    });

    expect(errors).toHaveLength(4);
    expect(new Set(errors.map((e) => e.field))).toEqual(
      new Set(["title", "description", "priority", "createdBy"]),
    );
  });
});
