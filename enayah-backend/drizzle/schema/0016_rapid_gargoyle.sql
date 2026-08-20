CREATE TYPE "public"."credential_verification_action" AS ENUM('verified', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."credential_verification_credential_type" AS ENUM('degree', 'board', 'fellowship', 'membership', 'license', 'life_support', 'malpractice');--> statement-breakpoint
ALTER TYPE "public"."file_category" ADD VALUE 'credential_verification_evidence' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "credential_verification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"credential_type" "credential_verification_credential_type" NOT NULL,
	"credential_id" uuid NOT NULL,
	"action" "credential_verification_action" NOT NULL,
	"remarks" text,
	"evidence_file_id" uuid,
	"performed_by_user_id" uuid NOT NULL,
	"performed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credential_verification_events" ADD CONSTRAINT "credential_verification_events_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_verification_events" ADD CONSTRAINT "credential_verification_events_evidence_file_id_files_id_fk" FOREIGN KEY ("evidence_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_verification_events" ADD CONSTRAINT "credential_verification_events_performed_by_user_id_users_id_fk" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credential_verification_events_employee_idx" ON "credential_verification_events" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "credential_verification_events_credential_idx" ON "credential_verification_events" USING btree ("credential_type","credential_id");--> statement-breakpoint
CREATE INDEX "credential_verification_events_performed_at_idx" ON "credential_verification_events" USING btree ("performed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credential_verification_events_evidence_file_uidx" ON "credential_verification_events" USING btree ("evidence_file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_employee_degree_document_file_id" ON "employee_degrees" USING btree ("document_file_id");