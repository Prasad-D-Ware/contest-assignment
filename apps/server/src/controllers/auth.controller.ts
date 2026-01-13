import prisma from "@contest-assignment/db";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express"
import { signupSchema, signinSchema } from "types/input-schema";
import jwt from "jsonwebtoken";

export const JWT_SECRET = "12321";

const signup = async (req : Request,res : Response) => {
    try {
        const { success , data } = signupSchema.safeParse(req.body);

        if(!success) {
            res.status(400).json({
                success : false,
                data : null,
                error :  "INVALID_REQUEST"
            })
            return;
        }

        const { name, email ,password , role } = data;

        const existing = await prisma.user.findUnique({
            where : {
                email
            }
        });

        if(existing){
            res.status(400).json({
                success: false,
                data: null,
                error: "EMAIL_ALREADY_EXISTS"
            });
            return;
        }

        const hashPassword = await bcrypt.hash(password,"10"); 
        
        const user = await prisma.user.create({
            data : {
                email,
                password : hashPassword,
                role,
                name
            }
        });

        res.status(201).json({
            "success": true,
            "data": {
              "id": user.id,
              "name": user.name,
              "email": user.email,
              "role": user.role
            },
            "error": null
          })
          return;
    } catch (error) {
        res.status(500).json({
                success: false,
                data: null,
                error: "Server Error"
        })
        return;
    }
}


const signin = async (req : Request,res : Response) => {
    try {
        const { success , data} = signinSchema.safeParse(req.body);

          if(!success) {
            res.status(400).json({
                success : false,
                data : null,
                error :  "INVALID_REQUEST"
            })
            return;
        }


        const { email , password } = data;

        const user = await prisma.user.findUnique({
            where : {
                email
            }
        })

        if(!user){
            res.status(401).json({
                "success": false,
                "data": null,
                "error": "INVALID_CREDENTIALS"
            })            
            return;
        }

        const verifiedPass = await bcrypt.compare(password,user.password);

        if(!verifiedPass){
            res.status(401).json({
                "success": false,
                "data": null,
                "error": "INVALID_CREDENTIALS"
            })            
            return; 
        }

        const token = jwt.sign({
            id : user.id,
            role :user.role
        },JWT_SECRET);

        res.status(200).json({
            "success": true,
            "data": {
              "token": token
            },
            "error": null
          })
          return;

        
    } catch (error) {
        res.status(500).json({
                success: false,
                data: null,
                error: "Server Error"
        })
        return;
    }
}

export const authControllers = {
    signup,
    signin
}