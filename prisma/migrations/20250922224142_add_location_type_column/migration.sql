-- AlterTable
ALTER TABLE "Location" ADD COLUMN "type" TEXT;

-- Update existing records to have a default type
UPDATE "Location" SET "type" = 'Unknown' WHERE "type" IS NULL;
