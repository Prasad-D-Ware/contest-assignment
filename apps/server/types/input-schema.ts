import z from "zod";

export const signupSchema = z.object({
        name: z.string(),
        email: z.email(),
        password : z.string(),
        role: z.enum(["contestee","creator"]).optional().default("contestee")
})

export const signinSchema = z.object({
        email: z.email(),
        password : z.string(),
})


export const createContestSchema = z.object({
                title: z.string(),
                description: z.string(),
                startTime: z.string(),
                endTime: z.string(),
})

export const createMcqQuestionSchema = z.object({
                questionText: z.string(),
                options: z.array(z.string()),
                correctOptionIndex: z.number(),
                points: z.number(),
});

export const createDsaQuestionSchema = z.object({
          title: z.string(),
          description: z.string(),
          tags: z.array(z.string()),
          points: z.number(),
          timeLimit: z.number(),
          memoryLimit: z.number(),
          testCases: z.array(z.object({
            input: z.array(z.string()),
            expectedOutput: z.array(z.string()),
            isHidden: z.boolean(),
          }))
        });
