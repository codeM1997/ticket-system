import { Router } from "express";
import { prisma } from "../prisma.js";

const usersRouter = Router();

usersRouter.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

export default usersRouter;
