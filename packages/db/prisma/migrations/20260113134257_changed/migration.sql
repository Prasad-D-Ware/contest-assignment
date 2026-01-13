/*
  Warnings:

  - You are about to drop the column `creator_id` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `correct_option_index` on the `McqQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `McqQuestion` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctOptionIndex` to the `McqQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `McqQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contest" DROP CONSTRAINT "Contest_creator_id_fkey";

-- AlterTable
ALTER TABLE "Contest" DROP COLUMN "creator_id",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "McqQuestion" DROP COLUMN "correct_option_index",
DROP COLUMN "question_text",
ADD COLUMN     "correctOptionIndex" INTEGER NOT NULL,
ADD COLUMN     "questionText" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
