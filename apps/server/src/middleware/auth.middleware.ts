import { JWT_SECRET } from "@/controllers/auth.controller";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const verifyJwt = (token: string) => {
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        return decoded;
    } catch (error) {
        return null
    }
}

export interface AuthenticatedRequest extends Request {
    user :{
        id :string,
        role :string
    }
}
export const authMiddleware = (req : Request, res: Response , next :NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
        res.status(401).json(
            {
                "success": false,
                "data": null,
                "error": "UNAUTHORIZED"
              }
        )
        return;
    }

    const decoded = verifyJwt(token) as {
        id :  string,
        role : string
    };

    if(!decoded) {
        res.status(401).json(
            {
                "success": false,
                "data": null,
                "error": "UNAUTHORIZED"
              }
        )
        return; 
    }
    (req as AuthenticatedRequest).user = {
        id :decoded.id,
        role :decoded.role
    }

    next();

}