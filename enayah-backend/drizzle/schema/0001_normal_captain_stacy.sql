CREATE TYPE "public"."email_type" AS ENUM('work', 'personal', 'secondary', 'other');--> statement-breakpoint
CREATE TYPE "public"."identification_type" AS ENUM('national_id', 'iqama', 'gcc_id', 'passport', 'other');--> statement-breakpoint
CREATE TYPE "public"."phone_type" AS ENUM('mobile', 'work', 'home', 'fax', 'other');--> statement-breakpoint
CREATE TABLE "employee_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"address_type" varchar(30) DEFAULT 'home' NOT NULL,
	"country_id" uuid,
	"city" varchar(100),
	"district" varchar(100),
	"street" varchar(255),
	"building" varchar(100),
	"postal_code" varchar(20),
	"additional_number" varchar(20),
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
CREATE TABLE "employee_dependents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"first_name_en" varchar(100) NOT NULL,
	"second_name_en" varchar(100),
	"third_name_en" varchar(100),
	"family_name_en" varchar(100) NOT NULL,
	"first_name_ar" varchar(100) NOT NULL,
	"second_name_ar" varchar(100),
	"third_name_ar" varchar(100),
	"family_name_ar" varchar(100) NOT NULL,
	"relationship" varchar(30) NOT NULL,
	"gender" "gender",
	"date_of_birth" date,
	"country_id" uuid,
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
CREATE TABLE "employee_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" "email_type" DEFAULT 'personal' NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
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
CREATE TABLE "employee_emergency_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"relationship" varchar(50),
	"mobile" varchar(30),
	"alternate_mobile" varchar(30),
	"address" text,
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
CREATE TABLE "employee_identifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"identification_type" "identification_type" NOT NULL,
	"identification_number" varchar(30) NOT NULL,
	"issue_date" date,
	"expiry_date" date,
	"sponsor" varchar(255),
	"issuing_authority" varchar(100),
	"occupation" varchar(150),
	"is_current" boolean DEFAULT true NOT NULL,
	"file_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "chk_employee_identification_valid_date_range" CHECK ("employee_identifications"."expiry_date" IS NULL
          OR "employee_identifications"."issue_date" IS NULL
          OR "employee_identifications"."expiry_date" >= "employee_identifications"."issue_date")
);
--> statement-breakpoint
CREATE TABLE "employee_phone_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" "phone_type" DEFAULT 'mobile' NOT NULL,
	"country_code" varchar(10),
	"phone_number" varchar(30) NOT NULL,
	"extension" varchar(10),
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_whatsapp" boolean DEFAULT false NOT NULL,
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
CREATE TABLE "employee_visas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"visa_number" varchar(50),
	"visa_type" varchar(100),
	"issue_date" date,
	"expiry_date" date,
	"is_current" boolean DEFAULT true NOT NULL,
	"file_id" uuid,
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
ALTER TABLE "employee_documents" ALTER COLUMN "document_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."employee_document_type";--> statement-breakpoint
CREATE TYPE "public"."employee_document_type" AS ENUM('cv', 'job_application', 'interview_evaluation', 'offer_letter', 'employment_contract', 'contract_amendment', 'contract_renewal', 'appointment_letter', 'job_description', 'nda', 'national_id', 'iqama', 'passport', 'visa', 'driving_license', 'gcc_id', 'other_identification', 'diploma', 'transcript', 'board_certificate', 'fellowship_certificate', 'training_certificate', 'professional_license', 'saudi_council_registration', 'home_country_license', 'bls_certificate', 'acls_certificate', 'pals_certificate', 'atls_certificate', 'life_support_other', 'primary_source_verification', 'background_check', 'reference_check', 'good_standing_certificate', 'pre_employment_medical', 'fit_to_work_certificate', 'vaccination_record', 'occupational_health_record', 'malpractice_insurance', 'health_insurance', 'orientation_certificate', 'probation_evaluation', 'performance_appraisal', 'promotion_letter', 'transfer_letter', 'disciplinary_action', 'warning_letter', 'termination_letter', 'resignation_letter', 'retirement_letter', 'sick_leave_certificate', 'maternity_leave_document', 'other');--> statement-breakpoint
ALTER TABLE "employee_documents" ALTER COLUMN "document_type" SET DATA TYPE "public"."employee_document_type" USING "document_type"::"public"."employee_document_type";--> statement-breakpoint
ALTER TABLE "employee_addresses" ADD CONSTRAINT "employee_addresses_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_addresses" ADD CONSTRAINT "employee_addresses_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_dependents" ADD CONSTRAINT "employee_dependents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_dependents" ADD CONSTRAINT "employee_dependents_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_emails" ADD CONSTRAINT "employee_emails_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_emergency_contacts" ADD CONSTRAINT "employee_emergency_contacts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_identifications" ADD CONSTRAINT "employee_identifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_identifications" ADD CONSTRAINT "employee_identifications_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_phone_numbers" ADD CONSTRAINT "employee_phone_numbers_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_visas" ADD CONSTRAINT "employee_visas_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_visas" ADD CONSTRAINT "employee_visas_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;