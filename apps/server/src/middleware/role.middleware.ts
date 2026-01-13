import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";

export const roleMiddleware = (role: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const userRole = (req as AuthenticatedRequest).user.role;
		if (!role.includes(userRole)) {
			return res.status(403).json({
				success: false,
				data: null,
				error: "FORBIDDEN",
			});
		}
		next();
	};
}