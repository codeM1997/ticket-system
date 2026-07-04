import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./errors.js";

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

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
