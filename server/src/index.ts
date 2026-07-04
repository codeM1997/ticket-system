import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

// Route modules will be mounted here in later tasks, e.g.:
// apiRouter.use("/tickets", ticketsRouter);
// apiRouter.use("/users", usersRouter);

app.use("/api", apiRouter);

// Error-handling middleware placeholder.
// Replaced with proper AppError handling + status mapping in task 6.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
