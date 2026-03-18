CREATE SCHEMA IF NOT EXISTS "app_private";--> statement-breakpoint

CREATE OR REPLACE FUNCTION "app_private"."current_audit_user_id"()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
	current_user_id text;
BEGIN
	current_user_id := current_setting('app.current_user_id', true);

	IF current_user_id IS NULL OR btrim(current_user_id) = '' THEN
		RETURN NULL;
	END IF;

	RETURN current_user_id::uuid;
EXCEPTION
	WHEN invalid_text_representation THEN
		RETURN NULL;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "app_private"."audit_record_id"(target_relid oid, row_data jsonb)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
	pk_columns text[];
	pk_payload jsonb;
BEGIN
	IF row_data IS NULL THEN
		RETURN NULL;
	END IF;

	SELECT array_agg(attribute.attname ORDER BY key_columns.ordinality)
	INTO pk_columns
	FROM pg_index primary_index
	INNER JOIN LATERAL unnest(primary_index.indkey) WITH ORDINALITY AS key_columns(attnum, ordinality)
		ON TRUE
	INNER JOIN pg_attribute attribute
		ON attribute.attrelid = primary_index.indrelid
		AND attribute.attnum = key_columns.attnum
	WHERE primary_index.indrelid = target_relid
		AND primary_index.indisprimary;

	IF pk_columns IS NULL OR array_length(pk_columns, 1) = 0 THEN
		RETURN COALESCE(row_data ->> 'id', row_data::text);
	END IF;

	IF array_length(pk_columns, 1) = 1 THEN
		RETURN COALESCE(row_data ->> pk_columns[1], row_data::text);
	END IF;

	SELECT jsonb_object_agg(column_name, row_data -> column_name ORDER BY column_name)
	INTO pk_payload
	FROM unnest(pk_columns) AS column_name;

	RETURN pk_payload::text;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "app_private"."write_audit_log"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	old_row jsonb;
	new_row jsonb;
	audit_action "public"."audit_action";
	changed_by_user_id uuid;
	audit_record_id text;
BEGIN
	IF TG_OP = 'INSERT' THEN
		audit_action := 'insert';
		old_row := NULL;
		new_row := to_jsonb(NEW);
	ELSIF TG_OP = 'UPDATE' THEN
		IF NEW IS NOT DISTINCT FROM OLD THEN
			RETURN NEW;
		END IF;

		audit_action := 'update';
		old_row := to_jsonb(OLD);
		new_row := to_jsonb(NEW);
	ELSIF TG_OP = 'DELETE' THEN
		audit_action := 'delete';
		old_row := to_jsonb(OLD);
		new_row := NULL;
	ELSE
		RETURN COALESCE(NEW, OLD);
	END IF;

	changed_by_user_id := "app_private"."current_audit_user_id"();
	audit_record_id := "app_private"."audit_record_id"(TG_RELID, COALESCE(new_row, old_row));

	INSERT INTO "public"."audit_logs" (
		"table_name",
		"record_id",
		"action",
		"changed_by_user_id",
		"old_data",
		"new_data"
	) VALUES (
		TG_TABLE_NAME,
		COALESCE(audit_record_id, 'unknown'),
		audit_action,
		changed_by_user_id,
		old_row,
		new_row
	);

	RETURN COALESCE(NEW, OLD);
END;
$$;--> statement-breakpoint

DO $$
DECLARE
	target_table text;
	target_tables text[] := ARRAY[
		'equipment',
		'fermentables',
		'hops',
		'miscs',
		'water_profiles',
		'yeasts',
		'recipes',
		'recipe_fermentables',
		'recipe_hops',
		'recipe_miscs',
		'recipe_yeasts',
		'batches',
		'plugins_registry'
	];
BEGIN
	FOREACH target_table IN ARRAY target_tables LOOP
		EXECUTE format('DROP TRIGGER IF EXISTS audit_row_changes ON "public".%I;', target_table);
		EXECUTE format(
			'CREATE TRIGGER audit_row_changes AFTER INSERT OR UPDATE OR DELETE ON "public".%I FOR EACH ROW EXECUTE FUNCTION "app_private"."write_audit_log"();',
			target_table
		);
	END LOOP;
END;
$$;
