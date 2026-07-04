import { Router } from "express";
import { prisma } from "../prisma.js";
import { AppError } from "../errors.js";
import { validateCommentCreate } from "../validation.js";

// mergeParams: true — mounted under /api/tickets/:id/comments, needs access
// to the parent router's :id param.
const commentsRouter = Router({ mergeParams: true });

// POST /api/tickets/:id/comments — add comment to ticket.
// Requirements: 6.1, 6.2, 9.2
commentsRouter.post("/", async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket) {
      throw new AppError(404, [{ field: "id", message: "Ticket not found" }]);
    }

    const errors = validateCommentCreate(req.body ?? {});
    if (errors.length > 0) {
      throw new AppError(400, errors);
    }

    const { message, createdBy } = req.body;

    const author = await prisma.user.findUnique({ where: { id: createdBy } });
    if (!author) {
      throw new AppError(400, [
        { field: "createdBy", message: "createdBy must be a valid user id" },
      ]);
    }

    const comment = await prisma.comment.create({
      data: {
        message,
        createdBy,
        ticketId: req.params.id,
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

export default commentsRouter;
