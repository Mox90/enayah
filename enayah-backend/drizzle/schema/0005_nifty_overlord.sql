CREATE TYPE "public"."iqama_renewal_status" AS ENUM('pending_upload', 'uploaded', 'under_process', 'approved', 'denied', 'completed', 'eoc_required');--> statement-breakpoint
CREATE TYPE "public"."notification_severity" AS ENUM('info', 'warning', 'success', 'error');--> statement-breakpoint
CREATE TABLE "iqama_renewal_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"identification_id" uuid NOT NULL,
	"status" "iqama_renewal_status" DEFAULT 'pending_upload' NOT NULL,
	"mhrsd_uploaded_at" timestamp,
	"mhrsd_approved_at" timestamp,
	"mhrsd_denied_at" timestamp,
	"government_relations_due_date" date,
	"notes" text,
	"denial_reason" text,
	"assigned_to_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "uq_iqama_renewal_case_identification" UNIQUE("identification_id")
);
--> statement-breakpoint
CREATE TABLE "notification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_id" uuid NOT NULL,
	"milestone" varchar(20) NOT NULL,
	"notification_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_notification_event" UNIQUE("source_type","source_id","milestone")
);
--> statement-breakpoint
CREATE TABLE "notification_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"recipient_user_id" uuid NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_id" uuid NOT NULL,
	"due_date" date,
	"severity" "notification_severity" DEFAULT 'info' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iqama_renewal_cases" ADD CONSTRAINT "iqama_renewal_cases_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iqama_renewal_cases" ADD CONSTRAINT "iqama_renewal_cases_identification_id_employee_identifications_id_fk" FOREIGN KEY ("identification_id") REFERENCES "public"."employee_identifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iqama_renewal_cases" ADD CONSTRAINT "iqama_renewal_cases_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_iqama_renewal_cases_employee" ON "iqama_renewal_cases" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_iqama_renewal_cases_status" ON "iqama_renewal_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_events_source_idx" ON "notification_events" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "notification_recipients_user_inbox_idx" ON "notification_recipients" USING btree ("recipient_user_id","is_archived","is_read");--> statement-breakpoint
CREATE INDEX "notifications_source_idx" ON "notifications" USING btree ("source_type","source_id");