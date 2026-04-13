CREATE TABLE "position_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_number" varchar(50) NOT NULL,
	"department_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"job_grade_id" uuid,
	"category_code" integer,
	"min_salary" numeric,
	"max_salary" numeric,
	"status" varchar(20) DEFAULT 'vacant' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "position_items_item_number_unique" UNIQUE("item_number")
);
--> statement-breakpoint
ALTER TABLE "position_items" ADD CONSTRAINT "position_items_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_items" ADD CONSTRAINT "position_items_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_items" ADD CONSTRAINT "position_items_job_grade_id_job_grades_id_fk" FOREIGN KEY ("job_grade_id") REFERENCES "public"."job_grades"("id") ON DELETE no action ON UPDATE no action;