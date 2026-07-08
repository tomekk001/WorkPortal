-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "nip" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_nip_key" ON "CompanyProfile"("nip");
