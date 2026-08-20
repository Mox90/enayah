CREATE TYPE "public"."appointment_type" AS ENUM('primary', 'acting', 'temporary', 'rotation', 'secondment', 'concurrent', 'permanent_transfer');--> statement-breakpoint
CREATE TYPE "public"."appraisal_rating" AS ENUM('outstanding', 'very_good', 'good', 'needs_improvement', 'unsatisfactory');--> statement-breakpoint
CREATE TYPE "public"."appraisal_status" AS ENUM('draft', 'planning_submitted', 'planning_acknowledged', 'evaluation_in_progress', 'submitted', 'manager_review', 'hr_review', 'calibrated', 'closed');--> statement-breakpoint
CREATE TYPE "public"."assignment_reason" AS ENUM('organizational_restructuring', 'temporary_coverage', 'promotion', 'management_decision', 'acting_capacity', 'rotation', 'service_need');--> statement-breakpoint
CREATE TYPE "public"."auth_providers" AS ENUM('local', 'ldap', 'oauth2', 'saml', 'openid');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'active', 'superseded', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('initial', 'renewal', 'amendment');--> statement-breakpoint
CREATE TYPE "public"."degree_type" AS ENUM('diploma', 'associate', 'bachelor', 'master', 'doctorate', 'other');--> statement-breakpoint
CREATE TYPE "public"."employee_document_type" AS ENUM('cv', 'job_application', 'interview_evaluation', 'job_offer_acceptance', 'letter_of_appointment', 'employment_contract', 'job_description', 'non_disclosure_agreement', 'primary_source_verification', 'background_check', 'reference_check', 'pre_employment_medical', 'fit_to_work_certificate', 'vaccination_record', 'sick_leave_certificate', 'maternity_leave_document', 'national_id', 'iqama', 'passport', 'other');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('active', 'terminated', 'resigned', 'eoc', 'transferred', 'on_leave');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'temporary', 'locum');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'not_specified');--> statement-breakpoint
CREATE TYPE "public"."license_status" AS ENUM('active', 'expired', 'suspended', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."life_support_type" AS ENUM('bls', 'acls', 'pals', 'atls', 'nrp', 'itls', 'blso', 'atcn', 'also', 'tncc', 'enpc', 'asls', 'esls', 'pfccs', 'other');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('initial', 'renewal', 'promotion', 'transfer', 'demotion', 'temporary_assignment', 'acting', 'amendment');--> statement-breakpoint
CREATE TYPE "public"."staff_category" AS ENUM('civilian', 'military', 'contractual');--> statement-breakpoint
CREATE TYPE "public"."workforce_category" AS ENUM('physician', 'nurse', 'allied_health', 'administrative', 'support_service');--> statement-breakpoint
CREATE TABLE "appraisal_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"relative_weight" numeric,
	"score" integer,
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
CREATE TABLE "appraisal_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(30),
	CONSTRAINT "chk_appraisal_valid_date_range" CHECK ("appraisal_cycles"."end_date" IS NULL OR "appraisal_cycles"."end_date" >= "appraisal_cycles"."start_date")
);
--> statement-breakpoint
CREATE TABLE "appraisal_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"goal_title" varchar(255) NOT NULL,
	"measurement_standard" text,
	"relative_weight" numeric,
	"target_output" varchar(255),
	"score" integer,
	"comments" varchar(500),
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
	"appraisal_id" uuid NOT NULL,
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
	"goal_section_weight" numeric,
	"competency_section_weight" numeric,
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
	"is_rejected" boolean DEFAULT false NOT NULL,
	"rejection_reason" text,
	"calibrated_at" timestamp,
	"calibrated_by" uuid,
	"manager_signed_at" timestamp,
	"manager_signed_by" uuid,
	"employee_signed_at" timestamp,
	"employee_signed_by" uuid,
	"ai_generated" boolean DEFAULT false NOT NULL,
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
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"resource_id" varchar(100),
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb,
	"ip" varchar(45),
	"user_agent" text,
	"success" boolean,
	"request_id" varchar(100),
	"module" varchar(50),
	"reviewed" boolean DEFAULT false,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"nationality_en" varchar(100),
	"nationality_ar" varchar(100),
	"alpha2" char(2) NOT NULL,
	"alpha3" char(3) NOT NULL,
	"numeric_code" char(3) NOT NULL,
	CONSTRAINT "countries_alpha2_unique" UNIQUE("alpha2"),
	CONSTRAINT "countries_alpha3_unique" UNIQUE("alpha3"),
	CONSTRAINT "countries_numeric_code_unique" UNIQUE("numeric_code")
);
--> statement-breakpoint
CREATE TABLE "cpd_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
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
CREATE TABLE "employee_boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"board_name" varchar(255) NOT NULL,
	"specialty" varchar(255),
	"issuing_body" varchar(255) NOT NULL,
	"issue_date" date,
	"expiry_date" date,
	"is_lifetime" boolean DEFAULT false NOT NULL,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_cpd_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"category_id" uuid,
	"title" varchar(255) NOT NULL,
	"provider" varchar(255),
	"hours" numeric(5, 2),
	"credit_points" numeric(5, 2),
	"activity_date" date,
	"document_file_id" uuid,
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
CREATE TABLE "employee_degrees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"degree_type" "degree_type" NOT NULL,
	"degree_name" varchar(255) NOT NULL,
	"major" varchar(255),
	"institution" varchar(255) NOT NULL,
	"country_id" uuid,
	"graduation_date" date,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_disciplinary_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"action_date" date NOT NULL,
	"description" varchar(1000),
	"document_file_id" uuid,
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
CREATE TABLE "employee_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"document_type" "employee_document_type" NOT NULL,
	"file_id" uuid NOT NULL,
	"title" varchar(255),
	"document_number" varchar(100),
	"issue_date" date,
	"expiry_date" date,
	"remarks" varchar(1000),
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_fellowships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"fellowship_name" varchar(255) NOT NULL,
	"abbreviation" varchar(50),
	"issuing_body" varchar(255) NOT NULL,
	"specialty" varchar(255),
	"issue_date" date,
	"expiry_date" date,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"authority" varchar(255) NOT NULL,
	"license_number" varchar(100) NOT NULL,
	"profession" varchar(255) NOT NULL,
	"specialty" varchar(255),
	"issue_date" date,
	"expiry_date" date NOT NULL,
	"status" "license_status" DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_life_support_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" "life_support_type" NOT NULL,
	"provider" varchar(255) NOT NULL,
	"certificate_number" varchar(100),
	"issue_date" date,
	"expiry_date" date,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_malpractice_insurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"insurance_company" varchar(255) NOT NULL,
	"policy_number" varchar(100) NOT NULL,
	"coverage_amount" numeric(15, 2),
	"start_date" date,
	"expiry_date" date,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_medical_examinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"examination_type" varchar(100) NOT NULL,
	"examination_date" date NOT NULL,
	"result" varchar(100),
	"facility_name" varchar(255),
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"organization" varchar(255) NOT NULL,
	"membership_number" varchar(100),
	"membership_level" varchar(100),
	"start_date" date,
	"expiry_date" date,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_primary_source_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"vendor" varchar(255) NOT NULL,
	"verification_reference_number" varchar(100),
	"verification_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "employee_training_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"completion_date" date NOT NULL,
	"expiry_date" date,
	"score" numeric(5, 2),
	"document_file_id" uuid,
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
CREATE TABLE "employee_vaccinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"vaccine_name" varchar(255) NOT NULL,
	"dose_number" integer,
	"vaccination_date" date,
	"expiry_date" date,
	"document_file_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"verification_remarks" text,
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
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" bigint NOT NULL,
	"storage_path" varchar(500) NOT NULL,
	"checksum" varchar(255),
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
CREATE TABLE "training_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
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
CREATE TABLE "training_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"validity_months" integer,
	"is_mandatory" boolean DEFAULT false NOT NULL,
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
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employment_id" uuid NOT NULL,
	"actual_department_id" uuid,
	"actual_position_id" uuid,
	"manager_id" uuid,
	"start_date" date NOT NULL,
	"end_date" date,
	"appointment_type" "appointment_type" DEFAULT 'primary' NOT NULL,
	"remarks" text,
	"assignment_reason" "assignment_reason",
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "chk_appointments_valid_date_range" CHECK ("appointments"."end_date" IS NULL OR "appointments"."end_date" >= "appointments"."start_date")
);
--> statement-breakpoint
CREATE TABLE "compensation_allowances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compensation_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compensations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_movement_id" uuid NOT NULL,
	"effective_date" date NOT NULL,
	"base_salary" numeric NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"reason" varchar(50),
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "compensations_contract_movement_id_unique" UNIQUE("contract_movement_id")
);
--> statement-breakpoint
CREATE TABLE "contract_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"position_item_id" uuid NOT NULL,
	"official_department_id" uuid NOT NULL,
	"official_position_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"sequence_number" integer DEFAULT 1 NOT NULL,
	"movement_type" "movement_type" DEFAULT 'initial' NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "uq_contract_sequence" UNIQUE("contract_id","sequence_number"),
	CONSTRAINT "chk_job_assignments_valid_date_range" CHECK ("contract_movements"."end_date" IS NULL OR "contract_movements"."end_date" >= "contract_movements"."start_date"),
	CONSTRAINT "sequence_number_whole_number" CHECK ("contract_movements"."sequence_number" >= 1)
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employment_id" uuid NOT NULL,
	"contract_number" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"contract_type" "contract_type" DEFAULT 'initial' NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"signed_date" date,
	"document_path" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number"),
	CONSTRAINT "chk_contracts_valid_date_range" CHECK ("contracts"."end_date" IS NULL OR "contracts"."end_date" >= "contracts"."start_date")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_number" varchar(10) NOT NULL,
	"first_name_en" varchar(100) NOT NULL,
	"second_name_en" varchar(100),
	"third_name_en" varchar(100),
	"family_name_en" varchar(100) NOT NULL,
	"first_name_ar" varchar(100) NOT NULL,
	"second_name_ar" varchar(100),
	"third_name_ar" varchar(100),
	"family_name_ar" varchar(100) NOT NULL,
	"date_of_birth" date,
	"gender" "gender",
	"country_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
CREATE TABLE "employments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"hire_date" date NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"employment_type" "employment_type",
	"staff_category" "staff_category" DEFAULT 'contractual' NOT NULL,
	"employment_status" "employment_status" DEFAULT 'active' NOT NULL,
	"cause_of_leaving" varchar(255),
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
CREATE TABLE "position_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"old_item_number" varchar(50),
	"item_number" varchar(50) NOT NULL,
	"department_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"job_grade_id" uuid,
	"workforce_category" "workforce_category",
	"category_code" integer,
	"min_salary" numeric,
	"max_salary" numeric,
	"status" varchar(20) DEFAULT 'vacant' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "position_items_item_number_unique" UNIQUE("item_number")
);
--> statement-breakpoint
CREATE TABLE "password_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255),
	"auth_provider" "auth_providers" DEFAULT 'local' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_secret" varchar(255),
	"mfa_secret_cipher" text,
	"mfa_secret_iv" varchar(24),
	"mfa_secret_tag" varchar(24),
	"mfa_enabled_at" timestamp,
	"mfa_disabled_at" timestamp,
	"last_login_at" timestamp,
	"last_failed_login_at" timestamp,
	"password_changed_at" timestamp,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"employee_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "users_mfa_enabled_requires_secret" CHECK ("users"."mfa_enabled" = false OR "users"."mfa_secret" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "position_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"role_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"level" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"department_id" uuid,
	"scope" varchar(50) DEFAULT 'hospital',
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"logo" varchar(255),
	"parent_department_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "job_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"min_salary" numeric,
	"max_salary" numeric,
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
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(150) NOT NULL,
	"title_ar" varchar(150),
	"grade_id" uuid,
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
CREATE TABLE "salaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employment_id" uuid NOT NULL,
	"basic_salary" numeric(12, 2) NOT NULL,
	"housing_allowance" numeric(12, 2),
	"transport_allowance" numeric(12, 2),
	"other_allowance" numeric(12, 2),
	"currency" varchar(10) DEFAULT 'SAR' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
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
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"user_agent" varchar(255),
	"ip" varchar(45),
	"is_revoked" boolean DEFAULT false,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"absolute_expires_at" timestamp with time zone NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_document_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_type" varchar(50),
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "legal_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employment_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"document_number" varchar(100),
	"issue_date" date,
	"expiry_date" date,
	"issuing_authority" varchar(255),
	"status" varchar(20) DEFAULT 'active',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "appraisal_competencies" ADD CONSTRAINT "appraisal_competencies_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_competencies" ADD CONSTRAINT "appraisal_competencies_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_goals" ADD CONSTRAINT "appraisal_goals_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_insights" ADD CONSTRAINT "appraisal_insights_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appraisal_outcomes" ADD CONSTRAINT "appraisal_outcomes_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "training_needs" ADD CONSTRAINT "training_needs_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_invitations" ADD CONSTRAINT "auth_invitations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_boards" ADD CONSTRAINT "employee_boards_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_boards" ADD CONSTRAINT "employee_boards_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_cpd_records" ADD CONSTRAINT "employee_cpd_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_cpd_records" ADD CONSTRAINT "employee_cpd_records_category_id_cpd_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cpd_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_cpd_records" ADD CONSTRAINT "employee_cpd_records_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_degrees" ADD CONSTRAINT "employee_degrees_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_degrees" ADD CONSTRAINT "employee_degrees_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_degrees" ADD CONSTRAINT "employee_degrees_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_disciplinary_actions" ADD CONSTRAINT "employee_disciplinary_actions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_disciplinary_actions" ADD CONSTRAINT "employee_disciplinary_actions_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_fellowships" ADD CONSTRAINT "employee_fellowships_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_fellowships" ADD CONSTRAINT "employee_fellowships_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_licenses" ADD CONSTRAINT "employee_licenses_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_licenses" ADD CONSTRAINT "employee_licenses_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_life_support_certifications" ADD CONSTRAINT "employee_life_support_certifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_life_support_certifications" ADD CONSTRAINT "employee_life_support_certifications_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_malpractice_insurance" ADD CONSTRAINT "employee_malpractice_insurance_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_malpractice_insurance" ADD CONSTRAINT "employee_malpractice_insurance_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_medical_examinations" ADD CONSTRAINT "employee_medical_examinations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_medical_examinations" ADD CONSTRAINT "employee_medical_examinations_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_memberships" ADD CONSTRAINT "employee_memberships_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_memberships" ADD CONSTRAINT "employee_memberships_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_primary_source_verifications" ADD CONSTRAINT "employee_primary_source_verifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_primary_source_verifications" ADD CONSTRAINT "employee_primary_source_verifications_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_training_records" ADD CONSTRAINT "employee_training_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_training_records" ADD CONSTRAINT "employee_training_records_course_id_training_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."training_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_training_records" ADD CONSTRAINT "employee_training_records_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_vaccinations" ADD CONSTRAINT "employee_vaccinations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_vaccinations" ADD CONSTRAINT "employee_vaccinations_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_category_id_training_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."training_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_employment_id_employments_id_fk" FOREIGN KEY ("employment_id") REFERENCES "public"."employments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_actual_department_id_departments_id_fk" FOREIGN KEY ("actual_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_actual_position_id_positions_id_fk" FOREIGN KEY ("actual_position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compensation_allowances" ADD CONSTRAINT "compensation_allowances_compensation_id_compensations_id_fk" FOREIGN KEY ("compensation_id") REFERENCES "public"."compensations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compensations" ADD CONSTRAINT "compensations_contract_movement_id_contract_movements_id_fk" FOREIGN KEY ("contract_movement_id") REFERENCES "public"."contract_movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_movements" ADD CONSTRAINT "contract_movements_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_movements" ADD CONSTRAINT "contract_movements_position_item_id_position_items_id_fk" FOREIGN KEY ("position_item_id") REFERENCES "public"."position_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_movements" ADD CONSTRAINT "contract_movements_official_department_id_departments_id_fk" FOREIGN KEY ("official_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_movements" ADD CONSTRAINT "contract_movements_official_position_id_positions_id_fk" FOREIGN KEY ("official_position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employment_id_employments_id_fk" FOREIGN KEY ("employment_id") REFERENCES "public"."employments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employments" ADD CONSTRAINT "employments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_items" ADD CONSTRAINT "position_items_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_items" ADD CONSTRAINT "position_items_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_items" ADD CONSTRAINT "position_items_job_grade_id_job_grades_id_fk" FOREIGN KEY ("job_grade_id") REFERENCES "public"."job_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_roles" ADD CONSTRAINT "position_roles_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_roles" ADD CONSTRAINT "position_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_levels" ADD CONSTRAINT "role_levels_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_department_id_departments_id_fk" FOREIGN KEY ("parent_department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_grade_id_job_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."job_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_employment_id_employments_id_fk" FOREIGN KEY ("employment_id") REFERENCES "public"."employments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_document_files" ADD CONSTRAINT "legal_document_files_document_id_legal_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_employment_id_employments_id_fk" FOREIGN KEY ("employment_id") REFERENCES "public"."employments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_employee_appraisal_employee_cycle" ON "employee_appraisals" USING btree ("employee_id","cycle_id") WHERE "employee_appraisals"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_resource" ON "audit_logs" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_audit_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_appointments_employment" ON "appointments" USING btree ("employment_id");--> statement-breakpoint
CREATE INDEX "idx_compensations_contract_movement" ON "compensations" USING btree ("contract_movement_id");--> statement-breakpoint
CREATE INDEX "idx_contract_movements_contract_id" ON "contract_movements" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_employment_id" ON "contracts" USING btree ("employment_id");--> statement-breakpoint
CREATE INDEX "idx_employments_employee_id" ON "employments" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "password_history_user_idx" ON "password_history" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_employee_unique" ON "users" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "position_role_unique" ON "position_roles" USING btree ("position_id","role_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_unique" ON "user_roles" USING btree ("user_id","role_id","department_id") WHERE "user_roles"."department_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_unique_no_dept" ON "user_roles" USING btree ("user_id","role_id") WHERE "user_roles"."department_id" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_departments_parent_department_id" ON "departments" USING btree ("parent_department_id");--> statement-breakpoint
CREATE INDEX "idx_departments_name_en_ar" ON "departments" USING btree ("name_en","name_ar");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_job_grades_name" ON "job_grades" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_positions_title_en_ar" ON "positions" USING btree ("title_en","title_ar");--> statement-breakpoint
CREATE INDEX "idx_salaries_employment_id" ON "salaries" USING btree ("employment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_refresh_token_hash_uq" ON "sessions" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_legal_docs_employment" ON "legal_documents" USING btree ("employment_id");