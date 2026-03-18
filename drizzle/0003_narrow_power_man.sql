CREATE TYPE "public"."ibu_formula" AS ENUM('tinseth', 'rager');--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "enabled_modules" jsonb DEFAULT '["core"]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "ibu_formula" "ibu_formula" DEFAULT 'tinseth' NOT NULL;