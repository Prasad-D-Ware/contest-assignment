import { contestControllers } from "@/controllers/contest.controller";
import { roleMiddleware } from "@/middleware/role.middleware";
import { Router } from "express";

const contestRouter = Router();

contestRouter.post("/",roleMiddleware(["creator"]),contestControllers.createContest);

contestRouter.get("/:id", contestControllers.getContest);

contestRouter.post("/:id/mcq",roleMiddleware(["creator"]),contestControllers.createMcqQuestion);

contestRouter.post("/:contestId/mcq/:questionId/submit",roleMiddleware(["contestee"]),contestControllers.submitMcqQuestion);

contestRouter.post("/:id/dsa",roleMiddleware(["creator"]),contestControllers.createDsaQuestion);


export default contestRouter;