-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'LEAD');

-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "seniority" "SeniorityLevel",
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
