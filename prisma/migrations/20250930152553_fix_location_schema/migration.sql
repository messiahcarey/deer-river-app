-- Fix Location table schema
-- Remove kind field if it exists
ALTER TABLE "Location" DROP COLUMN IF EXISTS "kind";

-- Add description field if it doesn't exist
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Add unique constraint on name if it doesn't exist
ALTER TABLE "Location" ADD CONSTRAINT IF NOT EXISTS "Location_name_key" UNIQUE ("name");
