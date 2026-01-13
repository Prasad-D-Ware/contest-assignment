-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('creator', 'contestee');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqQuestion" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_option_index" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McqQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaQuestion" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "time_limit" INTEGER NOT NULL DEFAULT 2000,
    "memory_limit" INTEGER NOT NULL DEFAULT 256,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DsaQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCases" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "input" TEXT[],
    "expected_output" TEXT[],
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqSubmissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_index" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McqSubmissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaSubmissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "test_cases_passed" INTEGER NOT NULL DEFAULT 0,
    "total_test_cases" INTEGER NOT NULL DEFAULT 0,
    "execution_time" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DsaSubmissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "McqSubmissions_user_id_question_id_key" ON "McqSubmissions"("user_id", "question_id");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqQuestion" ADD CONSTRAINT "McqQuestion_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaQuestion" ADD CONSTRAINT "DsaQuestion_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmissions" ADD CONSTRAINT "McqSubmissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqSubmissions" ADD CONSTRAINT "McqSubmissions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "McqQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmissions" ADD CONSTRAINT "DsaSubmissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DsaSubmissions" ADD CONSTRAINT "DsaSubmissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "DsaQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
