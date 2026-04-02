CREATE TABLE "password_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "employee_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appraisal_competencies" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "appraisal_competencies" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "appraisal_goals" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "appraisal_goals" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "employments" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "employments" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_employee_unique" ON "users" USING btree ("employee_id");