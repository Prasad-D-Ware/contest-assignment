import type { AuthenticatedRequest } from "@/middleware/auth.middleware";
import prisma from "@contest-assignment/db";
import type { Request, Response } from "express";
import { createContestSchema, createDsaQuestionSchema, createMcqQuestionSchema } from "types/input-schema";

const createContest = async (req: Request, res: Response) => {
    try {

        const { success, data } = createContestSchema.safeParse(req.body);

        const { id : creatorId } = (req as AuthenticatedRequest).user;

        if(!success) {
            res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            })
            return;
        }

        const { title, description, startTime, endTime } = data;

        const contest = await prisma.contest.create({
            data: {
                title,
                description,
                start_time: new Date(startTime),
                end_time: new Date(endTime),
                creatorId: creatorId
            }
        })

        res.status(201).json(
            {
                "success": true,
                "data": {
                  "id": contest.id,
                  "title": contest.title,
                  "description": contest.description,
                  "creatorId": contest.creatorId,
                  "startTime": contest.start_time.toISOString(),
                  "endTime": contest.end_time.toISOString()
                },
                "error": null
              }
        )
        return;
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: "Server Error"
        })
    }
}

const getContest = async (req: Request, res: Response) => {
    try {

        const { id : contestId } = req.params as { id : string};
        const userRole = (req as AuthenticatedRequest).user.role;

        if(!contestId) {
            res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            })
            return;
        }

        const contest = await prisma.contest.findUnique({
            where : {
                id : contestId
            },
            include : {
                McqQuestions : {
                    select :{
                        id : true,
                        questionText : true,
                        options : true,
                        points : true,
                        correct_option_index : true,
                    }
                },
                DsaQuestions : {
                    select :{
                        id : true,
                        title : true,
                        description : true,
                        tags : true,
                        points : true,
                        time_limit : true,
                        memory_limit : true,
                    }
                },
            }

        })

        if(!contest) {
            res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            })
            return;
        }

        // Format MCQs - exclude correctOptionIndex for contestees
        const mcqs = contest.McqQuestions.map(mcq => {
            const formatted: any = {
                id: mcq.id,
                questionText: mcq.questionText,
                options: mcq.options,
                points: mcq.points,
            };
            // Only include correctOptionIndex for creators
            if (userRole === 'creator') {
                formatted.correctOptionIndex = mcq.correct_option_index;
            }
            return formatted;
        });

        // Format DSA problems with camelCase
        const dsaProblems = contest.DsaQuestions.map(dsa => ({
            id: dsa.id,
            title: dsa.title,
            description: dsa.description,
            tags: dsa.tags,
            points: dsa.points,
            timeLimit: dsa.time_limit,
            memoryLimit: dsa.memory_limit,
        }));

        res.status(200).json({
            success: true,
            data: {
                id: contest.id,
                title: contest.title,
                description: contest.description,
                creatorId: contest.creatorId,
                startTime: contest.start_time.toISOString(),
                endTime: contest.end_time.toISOString(),
                mcqs,
                dsaProblems,
            },
            error: null
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

const createMcqQuestion = async (req: Request, res: Response) => {
    try {
        const { success, data } = createMcqQuestionSchema.safeParse(req.body);

        const { id : contestId } = req.params as { id : string}; 
        const { id : creatorId } = (req as AuthenticatedRequest).user;

        if(!contestId || !creatorId) {
            res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            })
            return;
        }

        const contest = await prisma.contest.findUnique({
            where : {
                id : contestId,
                creatorId : creatorId
            }
        })

        if(!contest) {
            res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            })
            return;
        }

        if(!success) {
            res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            })
            return;
        }

        
        const { questionText, options, correctOptionIndex, points } = data;

        const mcqQuestion = await prisma.mcqQuestion.create({
            data: {
                contest_id : contestId,
                questionText,
                options,
                correct_option_index : correctOptionIndex,
                points : points,
            }
        })

        res.status(201).json(
            {
                "success": true,
                "data": {
                  "id": mcqQuestion.id,
                  "contestId": mcqQuestion.contest_id
                },
                "error": null
              }
        )
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

const submitMcqQuestion = async (req: Request, res: Response) => {
    try{
        const { selectedOptionIndex } = req.body;

        const { contestId, questionId } = req.params as { contestId: string, questionId: string };
        const { id : userId } = (req as AuthenticatedRequest).user;

        if(!selectedOptionIndex || !contestId || !questionId || !userId) {
            res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            })
            return;
        }

        const contest = await prisma.contest.findUnique({
            where : {
                id : contestId
            }
        })
        
        if(!contest) {
            res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            })
            return;
        }

        if(contest.end_time < new Date()) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "CONTEST_NOT_ACTIVE"
              })
            return;
        }

        const mcqQuestion = await prisma.mcqQuestion.findUnique({
            where : {
                id : questionId,
                contest_id : contestId,
            }
        })

        const existingSubmission = await prisma.mcqSubmissions.findFirst({
            where : {
                user_id : userId,
                question_id : questionId,
            }
        })

        if(existingSubmission) {
            res.status(400).json({
                success: false,
                data: null,
                error: "ALREADY_SUBMITTED"
            })
            return;
        }

        if(!mcqQuestion) {
            res.status(404).json({
                success: false,
                data: null,
                error: "QUESTION_NOT_FOUND"
            })
            return;
        }

        const isCorrect = selectedOptionIndex === mcqQuestion.correct_option_index;

        const mcqSubmission = await prisma.mcqSubmissions.create({
            data: {
                user_id : userId,
                question_id : questionId,
                selected_option_index : selectedOptionIndex,
                is_correct : isCorrect,
                points_earned: isCorrect ? mcqQuestion.points : 0
            }
        })

        res.status(201).json({
            "success": true,
            "data": {
              "isCorrect": isCorrect,
              "pointsEarned":  mcqSubmission.points_earned 
            },
            "error": null
          })
          return;
        
    }catch(error){
        res.status(500).json({
            success: false,
            data: null,
            error: "Server Error"
        })
        return;
    }
}

const createDsaQuestion = async (req: Request, res: Response) => {
    try{
        const { success, data } = createDsaQuestionSchema.safeParse(req.body);


        const { id : contestId } = req.params as { id : string}; 
        const { id : creatorId } = (req as AuthenticatedRequest).user;

        if(!contestId || !creatorId || !success) {
            res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            })
            return;
        }

        const contest = await prisma.contest.findUnique({
            where : {
                id : contestId,
                creatorId : creatorId
            }
        })
        
        if(!contest) {
            res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            })
            return;
        }

        const { title, description, tags, points, timeLimit, memoryLimit, testCases } = data;

        const dsaQuestion = await prisma.dsaQuestion.create({
            data: {
                contest_id : contestId,
                title,
                description,
                tags,
                points,
                time_limit : timeLimit,
                memory_limit : memoryLimit,
            }
        })

        for(const testCase of testCases) {
            await prisma.testCases.create({
                data: {
                    problem_id : dsaQuestion.id,
                    input : testCase.input,
                    expected_output : testCase.expectedOutput,
                    is_hidden : testCase.isHidden,
                }
            })
        }

        res.status(201).json({
            success: true,
            data: {
                id: dsaQuestion.id,
                contestId: dsaQuestion.contest_id
            },
            error: null
        })
        return;
    }catch(error){
        res.status(500).json({
            success: false,
            data: null,
            error: "Server Error"
        })
        return;
    }
}

export const contestControllers = {
    createContest,
    getContest,
    createMcqQuestion,
    submitMcqQuestion,
    createDsaQuestion

}