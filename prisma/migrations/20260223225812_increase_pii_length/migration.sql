/*
  Warnings:

  - Added the required column `updatedAt` to the `tab_country_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userDescription` to the `tab_status_catalog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tab_country_rules" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validationRegex" TEXT,
ALTER COLUMN "ruleValue" DROP NOT NULL,
ALTER COLUMN "operator" DROP NOT NULL,
ALTER COLUMN "operator" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "tab_status_catalog" ADD COLUMN     "userDescription" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tab_country_rules_countryCode_isActive_idx" ON "tab_country_rules"("countryCode", "isActive");
