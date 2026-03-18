CREATE TYPE "public"."audit_action" AS ENUM('insert', 'update', 'delete', 'restore');--> statement-breakpoint
CREATE TYPE "public"."batch_status" AS ENUM('draft', 'brewing', 'fermenting', 'conditioning', 'finished');--> statement-breakpoint
CREATE TYPE "public"."brew_type" AS ENUM('beer', 'wine', 'mead');--> statement-breakpoint
CREATE TYPE "public"."hop_use_phase" AS ENUM('mash', 'first_wort', 'boil', 'whirlpool', 'dry_hop');--> statement-breakpoint
CREATE TYPE "public"."ibu_formula" AS ENUM('tinseth', 'rager');--> statement-breakpoint
CREATE TYPE "public"."misc_use_phase" AS ENUM('mash', 'boil', 'whirlpool', 'fermentation', 'packaging');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"allow_registrations" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"changed_by_user_id" uuid,
	"old_data" jsonb,
	"new_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch_telemetry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"gravity" numeric(6, 3),
	"temperature_c" numeric(5, 2),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"equipment_id" uuid,
	"status" "batch_status" DEFAULT 'draft' NOT NULL,
	"brew_date" timestamp with time zone,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"actual_batch_size_l" numeric(8, 3),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"efficiency_pct" numeric(5, 2) DEFAULT '75.00' NOT NULL,
	"batch_size_l" numeric(8, 3) NOT NULL,
	"boil_off_rate_lph" numeric(8, 3) NOT NULL,
	"mash_tun_loss_l" numeric(8, 3) DEFAULT '0' NOT NULL,
	"trub_loss_l" numeric(8, 3) DEFAULT '0' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fermentables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" text NOT NULL,
	"type" text DEFAULT 'grain' NOT NULL,
	"brand" text,
	"origin" text,
	"supplier" text,
	"source_url" text,
	"yield_pct" numeric(5, 2) NOT NULL,
	"color_lovibond" numeric(6, 2) DEFAULT '0' NOT NULL,
	"moisture_pct" numeric(5, 2),
	"coarse_fine_diff_pct" numeric(5, 2),
	"diastatic_power_lintner" numeric(8, 2),
	"protein_pct" numeric(5, 2),
	"max_in_batch_pct" numeric(5, 2),
	"recommend_mash" boolean DEFAULT true NOT NULL,
	"is_extract" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" text NOT NULL,
	"origin" text,
	"supplier" text,
	"source_url" text,
	"alpha_acid_pct" numeric(5, 2) NOT NULL,
	"beta_acid_pct" numeric(5, 2),
	"form" text DEFAULT 'pellet' NOT NULL,
	"type" text DEFAULT 'bittering' NOT NULL,
	"hsi_pct" numeric(5, 2),
	"cohumulone_pct" numeric(5, 2),
	"myrcene_pct" numeric(5, 2),
	"substitutes" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "miscs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"use_for" text,
	"supplier" text,
	"source_url" text,
	"description" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugins_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plugin_name" text NOT NULL,
	"version" text NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"config_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plugins_registry_plugin_name_unique" UNIQUE("plugin_name")
);
--> statement-breakpoint
CREATE TABLE "recipe_fermentables" (
	"recipe_id" uuid NOT NULL,
	"fermentable_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"amount_kg" numeric(8, 4) NOT NULL,
	"use_phase" text DEFAULT 'mash' NOT NULL,
	"notes" text,
	CONSTRAINT "recipe_fermentables_recipe_id_fermentable_id_sort_order_pk" PRIMARY KEY("recipe_id","fermentable_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "recipe_hops" (
	"recipe_id" uuid NOT NULL,
	"hop_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"amount_kg" numeric(8, 4) NOT NULL,
	"time_min" integer,
	"use_phase" "hop_use_phase" DEFAULT 'boil' NOT NULL,
	"notes" text,
	CONSTRAINT "recipe_hops_recipe_id_hop_id_sort_order_pk" PRIMARY KEY("recipe_id","hop_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "recipe_miscs" (
	"recipe_id" uuid NOT NULL,
	"misc_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"amount_kg" numeric(8, 4),
	"amount_l" numeric(8, 4),
	"amount_is_weight" boolean DEFAULT true NOT NULL,
	"time_min" integer,
	"use_phase" "misc_use_phase" DEFAULT 'boil' NOT NULL,
	"notes" text,
	CONSTRAINT "recipe_miscs_recipe_id_misc_id_sort_order_pk" PRIMARY KEY("recipe_id","misc_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "recipe_yeasts" (
	"recipe_id" uuid NOT NULL,
	"yeast_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"amount_kg" numeric(8, 4),
	"amount_l" numeric(8, 4),
	"amount_is_weight" boolean DEFAULT true NOT NULL,
	"cells_billions" numeric(10, 2),
	"is_starter_required" boolean DEFAULT false NOT NULL,
	"notes" text,
	CONSTRAINT "recipe_yeasts_recipe_id_yeast_id_sort_order_pk" PRIMARY KEY("recipe_id","yeast_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"equipment_id" uuid,
	"source_water_profile_id" uuid,
	"name" text NOT NULL,
	"brew_type" "brew_type" DEFAULT 'beer' NOT NULL,
	"style" text,
	"notes" text,
	"advanced_mode" boolean DEFAULT false NOT NULL,
	"enabled_modules" jsonb DEFAULT '["core"]'::jsonb NOT NULL,
	"hidden_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"target_batch_size_l" numeric(8, 3) NOT NULL,
	"boil_time_min" integer DEFAULT 60 NOT NULL,
	"ibu_formula" "ibu_formula" DEFAULT 'tinseth' NOT NULL,
	"target_og" numeric(6, 3),
	"target_fg" numeric(6, 3),
	"target_ibu" numeric(6, 2),
	"target_srm" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"preferences" jsonb DEFAULT '{"units":"metric","enabled_features":[],"advanced_mode":false}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "water_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" text NOT NULL,
	"calcium_ppm" numeric(8, 2) DEFAULT '0' NOT NULL,
	"magnesium_ppm" numeric(8, 2) DEFAULT '0' NOT NULL,
	"sodium_ppm" numeric(8, 2) DEFAULT '0' NOT NULL,
	"chloride_ppm" numeric(8, 2) DEFAULT '0' NOT NULL,
	"sulfate_ppm" numeric(8, 2) DEFAULT '0' NOT NULL,
	"bicarbonate_ppm" numeric(8, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "yeasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" text NOT NULL,
	"lab" text,
	"supplier" text,
	"source_url" text,
	"product_code" text,
	"type" text DEFAULT 'ale' NOT NULL,
	"form" text DEFAULT 'dry' NOT NULL,
	"attenuation_pct" numeric(5, 2),
	"min_temperature_c" numeric(5, 2),
	"max_temperature_c" numeric(5, 2),
	"flocculation" text,
	"best_for" text,
	"max_reuse" integer,
	"inventory" text,
	"culture_date" timestamp with time zone,
	"add_to_secondary" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_telemetry" ADD CONSTRAINT "batch_telemetry_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fermentables" ADD CONSTRAINT "fermentables_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hops" ADD CONSTRAINT "hops_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miscs" ADD CONSTRAINT "miscs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_fermentables" ADD CONSTRAINT "recipe_fermentables_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_fermentables" ADD CONSTRAINT "recipe_fermentables_fermentable_id_fermentables_id_fk" FOREIGN KEY ("fermentable_id") REFERENCES "public"."fermentables"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_hops" ADD CONSTRAINT "recipe_hops_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_hops" ADD CONSTRAINT "recipe_hops_hop_id_hops_id_fk" FOREIGN KEY ("hop_id") REFERENCES "public"."hops"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_miscs" ADD CONSTRAINT "recipe_miscs_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_miscs" ADD CONSTRAINT "recipe_miscs_misc_id_miscs_id_fk" FOREIGN KEY ("misc_id") REFERENCES "public"."miscs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_yeasts" ADD CONSTRAINT "recipe_yeasts_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_yeasts" ADD CONSTRAINT "recipe_yeasts_yeast_id_yeasts_id_fk" FOREIGN KEY ("yeast_id") REFERENCES "public"."yeasts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_source_water_profile_id_water_profiles_id_fk" FOREIGN KEY ("source_water_profile_id") REFERENCES "public"."water_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_profiles" ADD CONSTRAINT "water_profiles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yeasts" ADD CONSTRAINT "yeasts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_table_record_idx" ON "audit_logs" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE INDEX "audit_logs_changed_by_idx" ON "audit_logs" USING btree ("changed_by_user_id");--> statement-breakpoint
CREATE INDEX "batch_telemetry_batch_idx" ON "batch_telemetry" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "batch_telemetry_recorded_at_idx" ON "batch_telemetry" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "batches_recipe_idx" ON "batches" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "batches_status_idx" ON "batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "equipment_owner_idx" ON "equipment" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "fermentables_owner_idx" ON "fermentables" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "hops_owner_idx" ON "hops" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "miscs_owner_idx" ON "miscs" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "recipes_author_idx" ON "recipes" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "recipes_equipment_idx" ON "recipes" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "water_profiles_owner_idx" ON "water_profiles" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "yeasts_owner_idx" ON "yeasts" USING btree ("owner_id");