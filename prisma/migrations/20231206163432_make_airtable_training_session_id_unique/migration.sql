/*
  Warnings:

  - A unique constraint covering the columns `[airtableTrainingSessionId]` on the table `Form` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "airtableTrainingSessionId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Form_airtableTrainingSessionId_key" ON "Form"("airtableTrainingSessionId");
