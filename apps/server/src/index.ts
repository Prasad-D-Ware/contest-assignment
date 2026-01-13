import { env } from "@contest-assignment/env/server";
import cors from "cors";
import express from "express";
import authRouter from "@/routers/auth.router";
import { authMiddleware } from "./middleware/auth.middleware";
import contestRouter from "./routers/contest.router";
import problemRouter from "./routers/problems.router";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/api/auth",authRouter);
app.use("/api/contests",authMiddleware, contestRouter);
app.use("/api/problems",authMiddleware,problemRouter);


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
