CREATE TYPE "public"."appraisal_status" AS ENUM('draft', 'planning_submitted', 'planning_acknowledged', 'evaluation_in_progress', 'submitted', 'manager_review', 'hr_review', 'calibrated', 'closed');--> statement-breakpoint
CREATE TABLE "appraisal_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"relative_weight" numeric,
	"score" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appraisal_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "appraisal_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"goal_title" varchar(255) NOT NULL,
	"measurement_standard" text,
	"relative_weight" numeric,
	"target_output" varchar(255),
	"score" numeric,
	"comments" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appraisal_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"type" varchar(50),
	"category" varchar(100),
	"description" text NOT NULL,
	"source" varchar(50) DEFAULT 'ai',
	"confidence_score" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appraisal_outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid,
	"recommended_action" varchar(50),
	"salary_increase_percent" numeric,
	"new_position_id" uuid,
	"approved_by" uuid,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "competency_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_en" varchar(255) NOT NULL,
	"domain_ar" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competency_id" uuid NOT NULL,
	"theme_name_en" varchar(255) NOT NULL,
	"theme_name_ar" varchar(255) NOT NULL,
	"behavioral_description_en" text,
	"behavioral_description_ar" text
);
--> statement-breakpoint
CREATE TABLE "employee_appraisals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"appraiser_id" uuid,
	"final_score" numeric,
	"overall_rating" "appraisal_rating",
	"appraisal_status" "appraisal_status" DEFAULT 'draft' NOT NULL,
	"strengths" jsonb,
	"development_areas" jsonb,
	"comments" text,
	"planning_submitted_at" timestamp,
	"planning_submitted_by" uuid,
	"planning_acknowledged_at" timestamp,
	"planning_acknowledged_by" uuid,
	"final_submitted_at" timestamp,
	"final_submitted_by" uuid,
	"final_acknowledged_at" timestamp,
	"final_acknowledged_by" uuid,
	"hr_approved_at" timestamp,
	"hr_approved_by" uuid,
	"is_rejected" boolean DEFAULT false,
	"rejection_reason" text,
	"calibrated_at" timestamp,
	"calibrated_by" uuid,
	"manager_signed_at" timestamp,
	"manager_signed_by" uuid,
	"employee_signed_at" timestamp,
	"employee_signed_by" uuid,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_trainings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"training_id" uuid,
	"training_need_id" uuid,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" varchar(30),
	"result" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "pips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"reason" text,
	"start_date" date,
	"end_date" date,
	"status" varchar(30),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "chk_performance_improvement_plans_valid_date_range" CHECK ("pips"."end_date" IS NULL OR "pips"."end_date" >= "pips"."start_date")
);
--> statement-breakpoint
CREATE TABLE "pip_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pip_id" uuid NOT NULL,
	"action" text,
	"due_date" timestamp,
	"status" varchar(30),
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "training_needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"appraisal_id" uuid,
	"competency_id" uuid,
	"priority" varchar(20),
	"reason" text,
	"status" varchar(30),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"description" text,
	"provider" varchar(150),
	"duration_hours" numeric
);
--> statement-breakpoint
ALTER TABLE "appraisal_competencies" ADD CONSTRAINT "appraisal_competencies_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_competencies" ADD CONSTRAINT "appraisal_competencies_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_goals" ADD CONSTRAINT "appraisal_goals_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_insights" ADD CONSTRAINT "appraisal_insights_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_outcomes" ADD CONSTRAINT "appraisal_outcomes_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_themes" ADD CONSTRAINT "competency_themes_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD CONSTRAINT "employee_appraisals_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD CONSTRAINT "employee_appraisals_cycle_id_appraisal_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."appraisal_cycles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD CONSTRAINT "employee_appraisals_appraiser_id_employees_id_fk" FOREIGN KEY ("appraiser_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_training_id_training_programs_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_training_need_id_training_needs_id_fk" FOREIGN KEY ("training_need_id") REFERENCES "public"."training_needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pips" ADD CONSTRAINT "pips_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pips" ADD CONSTRAINT "pips_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pip_actions" ADD CONSTRAINT "pip_actions_pip_id_pips_id_fk" FOREIGN KEY ("pip_id") REFERENCES "public"."pips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_needs" ADD CONSTRAINT "training_needs_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_needs" ADD CONSTRAINT "training_needs_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_needs" ADD CONSTRAINT "training_needs_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE no action ON UPDATE no action;