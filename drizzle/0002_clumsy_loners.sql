CREATE TYPE "public"."brew_type" AS ENUM('beer', 'wine', 'mead');--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "brew_type" "brew_type" DEFAULT 'beer' NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "hidden_fields" jsonb DEFAULT '[]'::jsonb NOT NULL;