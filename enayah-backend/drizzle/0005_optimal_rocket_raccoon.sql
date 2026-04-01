ALTER TABLE "appraisal_outcomes" DROP CONSTRAINT "appraisal_outcomes_appraisal_id_employee_appraisals_id_fk";
--> statement-breakpoint
ALTER TABLE "appraisal_competencies" ALTER COLUMN "score" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "appraisal_goals" ALTER COLUMN "score" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "appraisal_outcomes" ALTER COLUMN "appraisal_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ALTER COLUMN "is_rejected" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ALTER COLUMN "ai_generated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "goal_section_weight" numeric;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "competency_section_weight" numeric;--> statement-breakpoint
ALTER TABLE "appraisal_outcomes" ADD CONSTRAINT "appraisal_outcomes_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_employee_appraisal_employee_cycle" ON "employee_appraisals" USING btree ("employee_id","cycle_id") WHERE "employee_appraisals"."deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE "appraisal_cycles" ADD CONSTRAINT "chk_appraisal_valid_date_range" CHECK ("appraisal_cycles"."end_date" IS NULL OR "appraisal_cycles"."end_date" >= "appraisal_cycles"."start_date");