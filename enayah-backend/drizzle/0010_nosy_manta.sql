ALTER TABLE "employees" DROP CONSTRAINT "employees_manager_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "employments" ADD COLUMN "item_number" varchar(50);--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "job_grades" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_departments_parent_department_id" ON "departments" USING btree ("parent_department_id");--> statement-breakpoint
CREATE INDEX "idx_departments_name_en_ar" ON "departments" USING btree ("name_en","name_ar");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_job_grades_name" ON "job_grades" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_positions_title_en_ar" ON "positions" USING btree ("title_en","title_ar");--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "manager_id";