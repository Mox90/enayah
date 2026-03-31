CREATE TYPE "public"."employment_status" AS ENUM('active', 'terminated', 'resigned', 'eoc', 'transferred', 'on_leave');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'temporary', 'locum');--> statement-breakpoint
ALTER TYPE "public"."gender" ADD VALUE 'not_specified';--> statement-breakpoint
ALTER TABLE "employments" RENAME COLUMN "status" TO "employment_status";--> statement-breakpoint
ALTER TABLE "job_assignments" DROP CONSTRAINT "job_assignments_manager_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "date_of_birth" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "employments" ALTER COLUMN "hire_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "employments" ALTER COLUMN "start_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "employments" ALTER COLUMN "end_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "employments" ALTER COLUMN "employment_type" SET DATA TYPE "public"."employment_type" USING "employment_type"::"public"."employment_type";--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "basic_salary" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "housing_allowance" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "transport_allowance" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "other_allowance" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "currency" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD CONSTRAINT "job_assignments_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_employments_employee_id" ON "employments" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_job_assignments_employment_id" ON "job_assignments" USING btree ("employment_id");--> statement-breakpoint
CREATE INDEX "idx_salaries_employment_id" ON "salaries" USING btree ("employment_id");--> statement-breakpoint
ALTER TABLE "job_assignments" ADD CONSTRAINT "chk_job_assignments_valid_date_range" CHECK ("job_assignments"."end_date" IS NULL OR "job_assignments"."end_date" >= "job_assignments"."start_date");