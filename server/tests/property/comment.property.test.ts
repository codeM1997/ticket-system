import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import request from "supertest";
import app from "../../src/index.js";
import { prisma } from "../../src/prisma.js";

// Feature: support-ticket-management, Property 10: Valid comment creation persists
//
// Validates Requirements 6.1.
//
// Feature: support-ticket-management, Property 11: Invalid comment creation yields 400
//
// Validates Requirements 6.2, 9.2.

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

async function createTicket() {
  const res = await request(app).post("/api/tickets").send({
    title: "Ticket for comment test",
    description: "Description",
    priority: "Low",
    createdBy: seededUserId,
  });
  return res.body.id as string;
}

const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

describe("Property 10: Valid comment creation persists", () => {
  it("any valid comment payload creates a comment associated with the ticket and retrievable", async () => {
    await fc.assert(
      fc.asyncProperty(nonEmptyStringArb, async (message) => {
        const ticketId = await createTicket();

        const res = await request(app)
          .post(`/api/tickets/${ticketId}/comments`)
          .send({ message, createdBy: seededUserId });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe(message);
        expect(res.body.createdBy).toBe(seededUserId);
        expect(res.body.id).toBeTruthy();
        expect(res.body.createdAt).toBeTruthy();

        const ticketRes = await request(app).get(`/api/tickets/${ticketId}`);
        const found = ticketRes.body.comments.find(
          (c: { id: string }) => c.id === res.body.id,
        );
        expect(found).toBeTruthy();
        expect(found.message).toBe(message);
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 11: Invalid comment creation yields 400", () => {
  const whitespaceStringArb = fc.constantFrom("", "   ", "\t", "\n", "  \n  ");

  it("empty/whitespace-only message returns 400", async () => {
    await fc.assert(
      fc.asyncProperty(whitespaceStringArb, async (message) => {
        const ticketId = await createTicket();

        const res = await request(app)
          .post(`/api/tickets/${ticketId}/comments`)
          .send({ message, createdBy: seededUserId });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it("missing createdBy returns 400", async () => {
    await fc.assert(
      fc.asyncProperty(nonEmptyStringArb, async (message) => {
        const ticketId = await createTicket();

        const res = await request(app)
          .post(`/api/tickets/${ticketId}/comments`)
          .send({ message });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});
