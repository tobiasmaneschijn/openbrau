ALTER TABLE "equipment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "equipment" CASCADE;--> statement-breakpoint
DROP INDEX IF EXISTS "recipes_equipment_idx";--> statement-breakpoint
ALTER TABLE "batches" DROP COLUMN IF EXISTS "equipment_id";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN IF EXISTS "equipment_id";