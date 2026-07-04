import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import request from "supertest";
import app from "../../src/index.js";
import { prisma } from "../../src/prisma.js";
import { PRIORITIES } from "../../src/validation.js";

// Feature: support-ticket-management, Property 1: New tickets always start Open
//
// Validates Requirements 1.1.
//
// Feature: support-ticket-management, Property 2: Missing required ticket fields yield 400
//
// Validates Requirements 1.2, 9.1.

let seededUserId: string;

beforeAll(async () => {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error(
      "No seeded users found. Run `npm run prisma:seed` before running tests.",
    );
  }
  seededUserId = user.id;
});

const validPriorityArb = fc.constantFrom(...PRIORITIES);
const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0);

describe("Property 1: New tickets always start Open", () => {
  it("any valid ticket creation payload results in status Open", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: nonEmptyStringArb,
          description: nonEmptyStringArb,
          priority: validPriorityArb,
        }),
        async ({ title, description, priority }) => {
          const res = await request(app)
            .post("/api/tickets")
            .send({ title, description, priority, createdBy: seededUserId });

          expect(res.status).toBe(201);
          expect(res.body.status).toBe("Open");
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("Property 2: Missing required ticket fields yield 400", () => {
  const fullValidPayload = () => ({
    title: "Valid title",
    description: "Valid description",
    priority: "Low" as const,
    createdBy: seededUserId,
  });

  // Arbitrary that omits/empties at least one required field.
  const missingFieldPayloadArb = fc
    .subarray(["title", "description", "priority", "createdBy"] as const, {
      minLength: 1,
    })
    .chain((fieldsToBreak) =>
      fc
        .record(
          Object.fromEntries(
            fieldsToBreak.map((f) => [f, fc.constantFrom("", undefined)]),
          ),
        )
        .map((broken) => ({ ...fullValidPayload(), ...broken })),
    );

  it("any payload missing/empty at least one required field returns 400 with non-empty errors", async () => {
    await fc.assert(
      fc.asyncProperty(missingFieldPayloadArb, async (payload) => {
        const res = await request(app).post("/api/tickets").send(payload);

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});
