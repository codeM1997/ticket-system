import { Router } from "express";
import { prisma } from "../prisma.js";
import { AppError } from "../errors.js";
import {
  validateTicketCreate,
  validateTicketUpdate,
  validateTransition,
} from "../validation.js";
import { canTransition } from "../stateMachine.js";
import commentsRouter from "./comments.js";

const ticketsRouter = Router();

ticketsRouter.use("/:id/comments", commentsRouter);

// POST /api/tickets — create ticket, always starts "Open".
// Requirements: 1.1, 1.2, 9.1
ticketsRouter.post("/", async (req, res, next) => {
  try {
    const errors = validateTicketCreate(req.body ?? {});
    if (errors.length > 0) {
      throw new AppError(400, errors);
    }

    const { title, description, priority, createdBy } = req.body;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        createdBy,
        status: "Open",
      },
    });

    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets?search=&status= — list tickets, most recently updated first.
// Requirements: 2.1, 2.2, 7.1, 7.2, 7.3
ticketsRouter.get("/", async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const where: Record<string, unknown> = {};

    if (typeof status === "string" && status.length > 0) {
      where.status = status;
    }

    let tickets = await prisma.ticket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    // SQLite's Prisma client has no case-insensitive "contains" mode, so
    // filter in JS to guarantee case-insensitive substring matching
    // regardless of underlying LIKE collation behavior.
    if (typeof search === "string" && search.length > 0) {
      const needle = search.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(needle) ||
          t.description.toLowerCase().includes(needle),
      );
    }

    res.json({ tickets });
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets/:id — full ticket with comments oldest first.
// Requirements: 3.1, 3.2, 6.4
ticketsRouter.get("/:id", async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      throw new AppError(404, [{ field: "id", message: "Ticket not found" }]);
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tickets/:id — partial update (title, description, priority, assignedTo).
// Requirements: 4.1, 4.2
ticketsRouter.patch("/:id", async (req, res, next) => {
  try {
    const errors = validateTicketUpdate(req.body ?? {});
    if (errors.length > 0) {
      throw new AppError(400, errors);
    }

    const { title, description, priority, assignedTo } = req.body;
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (assignedTo !== undefined) data.assignedTo = assignedTo;

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data,
    });

    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

// POST /api/tickets/:id/transitions — status transition via state machine.
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
ticketsRouter.post("/:id/transitions", async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket) {
      throw new AppError(404, [{ field: "id", message: "Ticket not found" }]);
    }

    const shapeErrors = validateTransition(req.body ?? {});
    if (shapeErrors.length > 0) {
      throw new AppError(400, shapeErrors);
    }

    const { toStatus } = req.body;

    if (!canTransition(ticket.status, toStatus)) {
      throw new AppError(400, [
        {
          field: "toStatus",
          message: `Invalid transition from ${ticket.status} to ${toStatus}`,
        },
      ]);
    }

    // Use status in where clause to prevent TOCTOU race: if another request
    // changed the status between our read and this write, updateMany returns
    // count 0 and we reject with 409.
    const result = await prisma.ticket.updateMany({
      where: { id: req.params.id, status: ticket.status },
      data: { status: toStatus },
    });

    if (result.count === 0) {
      throw new AppError(409, [
        {
          field: "toStatus",
          message: `Conflict: ticket status changed concurrently`,
        },
      ]);
    }

    const updated = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default ticketsRouter;
