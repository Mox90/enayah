CREATE TABLE "position_item_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_item_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"effective_date" date NOT NULL,
	"item_number" varchar(50) NOT NULL,
	"department_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"job_grade_id" uuid,
	"workforce_category" "workforce_category",
	"category_code" integer,
	"min_salary" numeric,
	"max_salary" numeric,
	"status" varchar(20) NOT NULL,
	"classification_source" varchar(20) NOT NULL,
	"classification_override_reason" text,
	"change_types" varchar(50)[] NOT NULL,
	"changed_fields" varchar(50)[] NOT NULL,
	"change_reason" text,
	"remarks" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by" uuid
);
--> statement-breakpoint
ALTER TABLE "position_item_history" ADD CONSTRAINT "position_item_history_position_item_id_position_items_id_fk" FOREIGN KEY ("position_item_id") REFERENCES "public"."position_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_item_history" ADD CONSTRAINT "position_item_history_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_item_history" ADD CONSTRAINT "position_item_history_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_item_history" ADD CONSTRAINT "position_item_history_job_grade_id_job_grades_id_fk" FOREIGN KEY ("job_grade_id") REFERENCES "public"."job_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_position_item_history_revision" ON "position_item_history" USING btree ("position_item_id","revision_number");--> statement-breakpoint
CREATE INDEX "idx_position_item_history_effective" ON "position_item_history" USING btree ("position_item_id","effective_date");--> statement-breakpoint
CREATE INDEX "idx_position_item_history_department" ON "position_item_history" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "idx_position_item_history_position" ON "position_item_history" USING btree ("position_id");--> statement-breakpoint
CREATE INDEX "idx_position_item_history_status" ON "position_item_history" USING btree ("status");