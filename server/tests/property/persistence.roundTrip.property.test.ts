import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import request from "supertest";
import app from "../../src/index.js";
import { prisma } from "../../src/prisma.js";
import { PRIORITIES } from "../../src/validation.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../src/generated/prisma/client.js";

// Feature: support-ticket-management, Property 14: Data persistence round trip
//
// Create via API, reconnect Prisma client, re-query, assert equal.
// Validates: Requirements 8.4

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

describe("Property 14: Data persistence round trip", () => {
  it("tickets created via API are retrievable from a fresh Prisma client", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: nonEmptyStringArb,
          description: nonEmptyStringArb,
          priority: validPriorityArb,
        }),
        async ({ title, description, priority }) => {
          // Create ticket through API
          const createRes = await request(app)
            .post("/api/tickets")
            .send({ title, description, priority, createdBy: seededUserId });

          expect(createRes.status).toBe(201);
          const created = createRes.body;

          // Connect a fresh Prisma client to same DB
          const url = process.env.DATABASE_URL ?? "file:./dev.db";
          const freshAdapter = new PrismaBetterSqlite3({ url });
          const freshPrisma = new PrismaClient({ adapter: freshAdapter });

          try {
            const persisted = await freshPrisma.ticket.findUnique({
              where: { id: created.id },
            });

            expect(persisted).not.toBeNull();
            expect(persisted!.title).toBe(created.title);
            expect(persisted!.description).toBe(created.description);
            expect(persisted!.priority).toBe(created.priority);
            expect(persisted!.status).toBe("Open");
            expect(persisted!.createdBy).toBe(seededUserId);
          } finally {
            await freshPrisma.$disconnect();
          }
        },
      ),
      { numRuns: 20 },
    );
  });

  it("comments created via API survive reconnection", async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArb,
        async (message) => {
          // Create a ticket first
          const ticketRes = await request(app)
            .post("/api/tickets")
            .send({
              title: "Persistence test",
              description: "For comment round trip",
              priority: "Low",
              createdBy: seededUserId,
            });
          const ticketId = ticketRes.body.id;

          // Add comment via API
          const commentRes = await request(app)
            .post(`/api/tickets/${ticketId}/comments`)
            .send({ message, createdBy: seededUserId });

          expect(commentRes.status).toBe(201);
          const created = commentRes.body;

          // Fresh client reconnection
          const url = process.env.DATABASE_URL ?? "file:./dev.db";
          const freshAdapter = new PrismaBetterSqlite3({ url });
          const freshPrisma = new PrismaClient({ adapter: freshAdapter });

          try {
            const persisted = await freshPrisma.comment.findUnique({
              where: { id: created.id },
            });

            expect(persisted).not.toBeNull();
            expect(persisted!.message).toBe(created.message);
            expect(persisted!.ticketId).toBe(ticketId);
            expect(persisted!.createdBy).toBe(seededUserId);
          } finally {
            await freshPrisma.$disconnect();
          }
        },
      ),
      { numRuns: 20 },
    );
  });
});
