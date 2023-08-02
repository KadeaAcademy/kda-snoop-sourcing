-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';


DO $$DECLARE temp_form record;
BEGIN
  FOR temp_form IN (SELECT "id", "name" FROM public."Form" WHERE name IS NOT NULL)
  LOOP
    UPDATE public."Form" SET "title"=temp_form."name" WHERE "id"=temp_form."id";
  END LOOP;
END$$;