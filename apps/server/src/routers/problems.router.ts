import { problemControllers } from "@/controllers/problem.controller";
import { Router } from "express";

const problemRouter = Router();

problemRouter.get("/:problemId", problemControllers.getProblem);

export default problemRouter;