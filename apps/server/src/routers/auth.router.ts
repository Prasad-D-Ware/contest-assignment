import { authControllers } from "@/controllers/auth.controller";
import { Router } from "express";

const authRouter = Router()


authRouter.post("/signup",authControllers.signup)
authRouter.post("/login",authControllers.signin)

export default authRouter;