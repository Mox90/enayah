CREATE TYPE "public"."file_category" AS ENUM('employee_avatar', 'employee_degree', 'employee_license', 'employee_board', 'employee_fellowship', 'employee_membership', 'employee_life_support', 'employee_malpractice', 'employee_identification', 'employee_contract', 'other');--> statement-breakpoint
CREATE TYPE "public"."file_visibility" AS ENUM('public', 'private');--> statement-breakpoint
DROP INDEX "idx_employees_avatar_file_id";--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "visibility" "file_visibility" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "category" "file_category" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "uploaded_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_files_visibility" ON "files" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_files_category" ON "files" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_files_uploaded_by_user_id" ON "files" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_employees_avatar_file_id" ON "employees" USING btree ("avatar_file_id");