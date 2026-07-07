import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/index.js";
import { prisma } from "../../src/prisma.js";

// Feature: support-ticket-management
// Integration tests for state machine over HTTP
// Validates Requirements 12.1, 12.2, 12.3

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

/** Create a fresh ticket via API and return its id. */
async function createTicket(): Promise<string> {
  const res = await request(app).post("/api/tickets").send({
    title: "Integration test ticket",
    description: "Created for state machine integration testing",
    priority: "Medium",
    createdBy: seededUserId,
  });
  expect(res.status).toBe(201);
  return res.body.id;
}

/** Transition a ticket and return the response. */
async function transition(ticketId: string, toStatus: string) {
  return request(app)
    .post(`/api/tickets/${ticketId}/transitions`)
    .send({ toStatus });
}

/** Drive a ticket through a sequence of statuses to reach the target fromStatus. */
async function driveToStatus(ticketId: string, target: string): Promise<void> {
  const paths: Record<string, string[]> = {
    Open: [],
    "In Progress": ["In Progress"],
    Resolved: ["In Progress", "Resolved"],
    Closed: ["In Progress", "Resolved", "Closed"],
    Cancelled: ["Cancelled"],
  };

  const steps = paths[target];
  if (!steps) throw new Error(`No path to reach status: ${target}`);

  for (const step of steps) {
    const res = await transition(ticketId, step);
    expect(res.status).toBe(200);
  }
}


describe("Valid state machine transitions over HTTP", () => {
  const validPairs: Array<{ from: string; to: string }> = [
    { from: "Open", to: "In Progress" },
    { from: "Open", to: "Cancelled" },
    { from: "In Progress", to: "Resolved" },
    { from: "In Progress", to: "Cancelled" },
    { from: "Resolved", to: "Closed" },
  ];

  for (const { from, to } of validPairs) {
    it(`${from} → ${to} succeeds and persists`, async () => {
      const ticketId = await createTicket();
      await driveToStatus(ticketId, from);

      const res = await transition(ticketId, to);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(to);

      // Re-fetch to verify persistence
      const getRes = await request(app).get(`/api/tickets/${ticketId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.status).toBe(to);
    });
  }
});

describe("Invalid state machine transitions over HTTP", () => {
  const invalidPairs: Array<{ from: string; to: string }> = [
    // Open — skip states
    { from: "Open", to: "Resolved" },
    { from: "Open", to: "Closed" },
    // In Progress — backwards and skip
    { from: "In Progress", to: "Open" },
    { from: "In Progress", to: "Closed" },
    // Resolved — backwards and lateral
    { from: "Resolved", to: "Open" },
    { from: "Resolved", to: "In Progress" },
    { from: "Resolved", to: "Cancelled" },
    // Closed — terminal, nothing allowed
    { from: "Closed", to: "Open" },
    { from: "Closed", to: "In Progress" },
    { from: "Closed", to: "Resolved" },
    { from: "Closed", to: "Cancelled" },
    // Cancelled — terminal, nothing allowed
    { from: "Cancelled", to: "Open" },
    { from: "Cancelled", to: "In Progress" },
    { from: "Cancelled", to: "Resolved" },
    { from: "Cancelled", to: "Closed" },
  ];

  for (const { from, to } of invalidPairs) {
    it(`${from} → ${to} is rejected with 400`, async () => {
      const ticketId = await createTicket();
      await driveToStatus(ticketId, from);

      const res = await transition(ticketId, to);
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
      expect(res.body.errors[0].message).toContain("Invalid transition");
    });
  }
});
