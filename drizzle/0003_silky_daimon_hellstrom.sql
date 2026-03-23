ALTER TABLE "batches" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "brew_type" "brew_type";--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "style" text;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "snapshot" jsonb;