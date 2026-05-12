/*
  Warnings:

  - The `contract` column on the `JobOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "contract",
ADD COLUMN     "contract" TEXT NOT NULL DEFAULT 'B2B';

-- DropEnum
DROP TYPE "ContractType";
