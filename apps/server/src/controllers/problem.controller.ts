import prisma from "@contest-assignment/db";
import type { Request, Response } from "express"

const getProblem = async (req: Request, res: Response) => {
    try {

        const { problemId } = req.params as { problemId : string};

        if(!problemId) {
            res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            })
            return;
        }

        const dsaProblem = await prisma.dsaQuestion.findUnique({
            where :{
                id : problemId
            }
        })

     

        if(!dsaProblem) {
            res.status(404).json({
                success: false,
                data: null,
                error: "PROBLEM_NOT_FOUND"
            })
            return;
        }

        const testCases = await prisma.testCases.findMany({
            where :{
                problem_id : problemId,
                is_hidden : false
            }
        })

        if(!testCases) {
            res.status(404).json({
                success: false,
                data: null,
                error: "TEST_CASES_NOT_FOUND"
            })
            return;
        } 

        const formattedProblem = {
            id: dsaProblem.id,
            contestId: dsaProblem.contest_id,
            title: dsaProblem.title,
            description: dsaProblem.description,
            tags: dsaProblem.tags || [],
            points: dsaProblem.points,
            timeLimit: dsaProblem.time_limit,
            memoryLimit: dsaProblem.memory_limit,
            visibleTestCases: testCases.map(testCase => ({
                input: testCase.input,
                expectedOutput: testCase.expected_output
            }))
        }

        res.status(200).json({
            success: true,
            data: formattedProblem,
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


export const problemControllers = {
    getProblem
}
