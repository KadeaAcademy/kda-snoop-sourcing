/*
  Warnings:

  - You are about to drop the column `title` on the `Form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Form" DROP COLUMN "title",
ADD COLUMN     "airtableTrainingSessionId" TEXT NOT NULL DEFAULT '';

DO $$DECLARE temp_form record;
BEGIN
  FOR temp_form IN (SELECT "id", "name" FROM public."Form" WHERE name IS NOT NULL)
  LOOP
    UPDATE public."Form" SET "airtableTrainingSessionId"=temp_form."name" WHERE "id"=temp_form."id";
  END LOOP;
END$$;