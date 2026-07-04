import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import request from "supertest";
import app from "../../src/index.js";
import { prisma } from "../../src/prisma.js";
import { PRIORITIES } from "../../src/validation.js";

// Feature: support-ticket-management, Property 3: Ticket list is ordered by updatedAt descending
//
// Validates Requirements 2.2.

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
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => s.trim().length > 0);

const ticketPayloadArb = fc.record({
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  priority: validPriorityArb,
});

describe("Property 3: Ticket list is ordered by updatedAt descending", () => {
  it("GET /api/tickets always returns tickets with non-increasing updatedAt", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(ticketPayloadArb, { minLength: 2, maxLength: 5 }),
        async (payloads) => {
          // Create tickets sequentially so their updatedAt timestamps are
          // interleaved with any tickets created by other tests, exercising
          // the global ordering invariant rather than just this run's data.
          for (const payload of payloads) {
            const res = await request(app)
              .post("/api/tickets")
              .send({ ...payload, createdBy: seededUserId });
            expect(res.status).toBe(201);
          }

          const listRes = await request(app).get("/api/tickets");
          expect(listRes.status).toBe(200);

          const tickets = listRes.body.tickets;
          expect(Array.isArray(tickets)).toBe(true);
          expect(tickets.length).toBeGreaterThanOrEqual(payloads.length);

          for (let i = 0; i < tickets.length - 1; i++) {
            const current = new Date(tickets[i].updatedAt).getTime();
            const next = new Date(tickets[i + 1].updatedAt).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }
        },
      ),
      { numRuns: 30 },
    );
  });
});
