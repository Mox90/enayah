ALTER TABLE "iqama_renewal_cases" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "iqama_renewal_cases" ALTER COLUMN "status" SET DEFAULT 'pending_upload'::text;--> statement-breakpoint
DROP TYPE "public"."iqama_renewal_status";--> statement-breakpoint
CREATE TYPE "public"."iqama_renewal_status" AS ENUM('pending_upload', 'uploaded_to_mhrsd', 'under_process', 'approved_by_mhrsd', 'denied_by_mhrsd', 'sent_to_government_relations', 'completed', 'eoc_required', 'cancelled');--> statement-breakpoint
ALTER TABLE "iqama_renewal_cases" ALTER COLUMN "status" SET DEFAULT 'pending_upload'::"public"."iqama_renewal_status";--> statement-breakpoint
ALTER TABLE "iqama_renewal_cases" ALTER COLUMN "status" SET DATA TYPE "public"."iqama_renewal_status" USING "status"::"public"."iqama_renewal_status";--> statement-breakpoint
ALTER TABLE "employee_identifications" ADD CONSTRAINT "chk_employee_identification_valid_hijri_date_range" CHECK ("employee_identifications"."expiry_date_hijri" IS NULL
          OR "employee_identifications"."issue_date_hijri" IS NULL
          OR "employee_identifications"."expiry_date_hijri" >= "employee_identifications"."issue_date_hijri");