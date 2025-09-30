-- AlterTable
ALTER TABLE "Location" DROP COLUMN IF EXISTS "kind";
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "description" TEXT;
