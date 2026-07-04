import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./errors.js";
import usersRouter from "./routes/users.js";
import ticketsRouter from "./routes/tickets.js";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/tickets", ticketsRouter);

app.use("/api", apiRouter);

app.use(errorHandler);

// Only auto-start the server when this module is run directly (not when
// imported by tests via supertest).
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
