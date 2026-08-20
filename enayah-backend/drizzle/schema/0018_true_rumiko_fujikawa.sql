-- CREATE TYPE "public"."contract_document_type" AS ENUM('initial', 'renewal', 'amendment');--> statement-breakpoint
-- CREATE TYPE "public"."employment_separation_status" AS ENUM('draft', 'pending_approval', 'approved', 'completed', 'cancelled');--> statement-breakpoint
-- CREATE TYPE "public"."employment_separation_type" AS ENUM('eoc', 'resignation', 'termination', 'retirement', 'transfer_out', 'death', 'mutual_agreement', 'other');--> statement-breakpoint
-- CREATE TYPE "public"."movement_action_type" AS ENUM('promotion', 'demotion', 'transfer');--> statement-breakpoint
-- ALTER TYPE "public"."status" RENAME TO "contract_status";--> statement-breakpoint
-- CREATE TABLE "contract_documents" (
-- 	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
-- 	"contract_id" uuid NOT NULL,
-- 	"contract_movement_id" uuid,
-- 	"file_id" uuid NOT NULL,
-- 	"document_type" "contract_document_type" NOT NULL,
-- 	"version_number" integer DEFAULT 1 NOT NULL,
-- 	"effective_date" date NOT NULL,
-- 	"signed_date" date,
-- 	"acknowledged_at" timestamp,
-- 	"remarks" text,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"created_by" uuid,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL,
-- 	"updated_by" uuid,
-- 	"is_deleted" boolean DEFAULT false NOT NULL,
-- 	"deleted_at" timestamp,
-- 	"deleted_by" uuid,
-- 	"version" integer DEFAULT 1 NOT NULL,
-- 	CONSTRAINT "uq_contract_document_version" UNIQUE("contract_id","version_number"),
-- 	CONSTRAINT "chk_contract_document_version" CHECK ("contract_documents"."version_number" >= 1)
-- );
-- --> statement-breakpoint
-- CREATE TABLE "contract_movement_actions" (
-- 	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
-- 	"contract_movement_id" uuid NOT NULL,
-- 	"action_type" "movement_action_type" NOT NULL,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"created_by" uuid,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL,
-- 	"updated_by" uuid,
-- 	"is_deleted" boolean DEFAULT false NOT NULL,
-- 	"deleted_at" timestamp,
-- 	"deleted_by" uuid,
-- 	"version" integer DEFAULT 1 NOT NULL,
-- 	CONSTRAINT "uq_contract_movement_action" UNIQUE("contract_movement_id","action_type")
-- );
-- --> statement-breakpoint
-- CREATE TABLE "employment_separations" (
-- 	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
-- 	"employment_id" uuid NOT NULL,
-- 	"separation_type" "employment_separation_type" NOT NULL,
-- 	"status" "employment_separation_status" DEFAULT 'draft' NOT NULL,
-- 	"notice_date" date,
-- 	"effective_date" date NOT NULL,
-- 	"reason" text,
-- 	"remarks" text,
-- 	"approved_by" uuid,
-- 	"approved_at" timestamp,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"created_by" uuid,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL,
-- 	"updated_by" uuid,
-- 	"is_deleted" boolean DEFAULT false NOT NULL,
-- 	"deleted_at" timestamp,
-- 	"deleted_by" uuid,
-- 	"version" integer DEFAULT 1 NOT NULL
-- );
-- --> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
-- DROP TYPE "public"."contract_status";--> statement-breakpoint
-- CREATE TYPE "public"."contract_status" AS ENUM('draft', 'active', 'superseded', 'expired', 'ended_early', 'cancelled');--> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."contract_status";--> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "status" SET DATA TYPE "public"."contract_status" USING "status"::"public"."contract_status";--> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "contract_type" SET DATA TYPE text;--> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "contract_type" SET DEFAULT 'initial'::text;--> statement-breakpoint
-- DROP TYPE "public"."contract_type";--> statement-breakpoint
-- CREATE TYPE "public"."contract_type" AS ENUM('initial', 'renewal');--> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "contract_type" SET DEFAULT 'initial'::"public"."contract_type";--> statement-breakpoint
-- ALTER TABLE "contracts" ALTER COLUMN "contract_type" SET DATA TYPE "public"."contract_type" USING "contract_type"::"public"."contract_type";--> statement-breakpoint
-- ALTER TABLE "employments" ALTER COLUMN "employment_status" SET DATA TYPE text;--> statement-breakpoint
-- ALTER TABLE "employments" ALTER COLUMN "employment_status" SET DEFAULT 'active'::text;--> statement-breakpoint
-- DROP TYPE "public"."employment_status";--> statement-breakpoint
-- CREATE TYPE "public"."employment_status" AS ENUM('pending', 'active', 'on_leave', 'suspended', 'ended');--> statement-breakpoint
-- ALTER TABLE "employments" ALTER COLUMN "employment_status" SET DEFAULT 'active'::"public"."employment_status";--> statement-breakpoint
-- ALTER TABLE "employments" ALTER COLUMN "employment_status" SET DATA TYPE "public"."employment_status" USING "employment_status"::"public"."employment_status";--> statement-breakpoint
-- ALTER TABLE "contract_movements" ALTER COLUMN "movement_type" SET DATA TYPE text;--> statement-breakpoint
-- DROP TYPE "public"."movement_type";--> statement-breakpoint
-- CREATE TYPE "public"."movement_type" AS ENUM('initial', 'renewal', 'amendment');--> statement-breakpoint
-- ALTER TABLE "contract_movements" ALTER COLUMN "movement_type" SET DATA TYPE "public"."movement_type" USING "movement_type"::"public"."movement_type";--> statement-breakpoint
-- ALTER TABLE "contract_movements" ALTER COLUMN "movement_type" DROP DEFAULT;--> statement-breakpoint
-- ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_contract_movement_id_contract_movements_id_fk" FOREIGN KEY ("contract_movement_id") REFERENCES "public"."contract_movements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "contract_movement_actions" ADD CONSTRAINT "contract_movement_actions_contract_movement_id_contract_movements_id_fk" FOREIGN KEY ("contract_movement_id") REFERENCES "public"."contract_movements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "employment_separations" ADD CONSTRAINT "employment_separations_employment_id_employments_id_fk" FOREIGN KEY ("employment_id") REFERENCES "public"."employments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- CREATE INDEX "idx_contract_documents_contract" ON "contract_documents" USING btree ("contract_id");--> statement-breakpoint
-- CREATE INDEX "idx_contract_movement_actions_movement" ON "contract_movement_actions" USING btree ("contract_movement_id");--> statement-breakpoint
-- CREATE INDEX "idx_contract_movement_actions_type" ON "contract_movement_actions" USING btree ("action_type");--> statement-breakpoint
-- CREATE INDEX "idx_employment_separations_employment" ON "employment_separations" USING btree ("employment_id");--> statement-breakpoint
-- CREATE INDEX "idx_employment_separations_status" ON "employment_separations" USING btree ("status");--> statement-breakpoint
-- CREATE INDEX "idx_employment_separations_effective_date" ON "employment_separations" USING btree ("effective_date");--> statement-breakpoint
-- ALTER TABLE "employments" DROP COLUMN "cause_of_leaving";--> statement-breakpoint
-- ALTER TABLE "employments" ADD CONSTRAINT "chk_employments_valid_date_range" CHECK (
--         "employments"."end_date" IS NULL
--         OR "employments"."end_date" >= "employments"."start_date"
--       );

CREATE TYPE "public"."contract_document_type"
AS ENUM('initial', 'renewal', 'amendment');
--> statement-breakpoint

CREATE TYPE "public"."employment_separation_status"
AS ENUM(
  'draft',
  'pending_approval',
  'approved',
  'completed',
  'cancelled'
);
--> statement-breakpoint

CREATE TYPE "public"."employment_separation_type"
AS ENUM(
  'eoc',
  'resignation',
  'termination',
  'retirement',
  'transfer_out',
  'death',
  'mutual_agreement',
  'other'
);
--> statement-breakpoint

CREATE TYPE "public"."movement_action_type"
AS ENUM(
  'promotion',
  'demotion',
  'transfer'
);
--> statement-breakpoint


-- ============================================================
-- CONTRACT STATUS ENUM
-- Rename old generic enum type "status" -> "contract_status"
-- ============================================================

ALTER TYPE "public"."status"
RENAME TO "contract_status";
--> statement-breakpoint


-- ============================================================
-- NEW TABLE: CONTRACT DOCUMENTS
-- ============================================================

CREATE TABLE "contract_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  "contract_id" uuid NOT NULL,

  "contract_movement_id" uuid,

  "file_id" uuid NOT NULL,

  "document_type" "contract_document_type" NOT NULL,

  "version_number" integer DEFAULT 1 NOT NULL,

  "effective_date" date NOT NULL,

  "signed_date" date,

  "acknowledged_at" timestamp,

  "remarks" text,

  "created_at" timestamp DEFAULT now() NOT NULL,

  "created_by" uuid,

  "updated_at" timestamp DEFAULT now() NOT NULL,

  "updated_by" uuid,

  "is_deleted" boolean DEFAULT false NOT NULL,

  "deleted_at" timestamp,

  "deleted_by" uuid,

  "version" integer DEFAULT 1 NOT NULL,

  CONSTRAINT "uq_contract_document_version"
    UNIQUE("contract_id", "version_number"),

  CONSTRAINT "chk_contract_document_version"
    CHECK ("contract_documents"."version_number" >= 1)
);
--> statement-breakpoint


-- ============================================================
-- NEW TABLE: CONTRACT MOVEMENT ACTIONS
-- ============================================================

CREATE TABLE "contract_movement_actions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  "contract_movement_id" uuid NOT NULL,

  "action_type" "movement_action_type" NOT NULL,

  "created_at" timestamp DEFAULT now() NOT NULL,

  "created_by" uuid,

  "updated_at" timestamp DEFAULT now() NOT NULL,

  "updated_by" uuid,

  "is_deleted" boolean DEFAULT false NOT NULL,

  "deleted_at" timestamp,

  "deleted_by" uuid,

  "version" integer DEFAULT 1 NOT NULL,

  CONSTRAINT "uq_contract_movement_action"
    UNIQUE(
      "contract_movement_id",
      "action_type"
    )
);
--> statement-breakpoint


-- ============================================================
-- NEW TABLE: EMPLOYMENT SEPARATIONS
-- ============================================================

CREATE TABLE "employment_separations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  "employment_id" uuid NOT NULL,

  "separation_type" "employment_separation_type" NOT NULL,

  "status" "employment_separation_status"
    DEFAULT 'draft'
    NOT NULL,

  "notice_date" date,

  "effective_date" date NOT NULL,

  "reason" text,

  "remarks" text,

  "approved_by" uuid,

  "approved_at" timestamp,

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


-- ============================================================
-- CONTRACT STATUS ENUM
--
-- Existing:
--   draft
--   active
--   superseded
--   expired
--   cancelled
--
-- New:
--   draft
--   active
--   superseded
--   expired
--   ended_early
--   cancelled
-- ============================================================

ALTER TABLE "contracts"
ALTER COLUMN "status"
SET DATA TYPE text;
--> statement-breakpoint

ALTER TABLE "contracts"
ALTER COLUMN "status"
SET DEFAULT 'draft'::text;
--> statement-breakpoint

DROP TYPE "public"."contract_status";
--> statement-breakpoint

CREATE TYPE "public"."contract_status"
AS ENUM(
  'draft',
  'active',
  'superseded',
  'expired',
  'ended_early',
  'cancelled'
);
--> statement-breakpoint

ALTER TABLE "contracts"
ALTER COLUMN "status"
SET DEFAULT 'draft'::"public"."contract_status";
--> statement-breakpoint

ALTER TABLE "contracts"
ALTER COLUMN "status"
SET DATA TYPE "public"."contract_status"
USING "status"::"public"."contract_status";
--> statement-breakpoint


-- ============================================================
-- CONTRACT TYPE ENUM
--
-- New lifecycle:
--   initial
--   renewal
--
-- Amendment is represented by contract_movements,
-- not by a separate contract row.
-- ============================================================

ALTER TABLE "contracts"
ALTER COLUMN "contract_type"
SET DATA TYPE text;
--> statement-breakpoint

ALTER TABLE "contracts"
ALTER COLUMN "contract_type"
SET DEFAULT 'initial'::text;
--> statement-breakpoint

DROP TYPE "public"."contract_type";
--> statement-breakpoint

CREATE TYPE "public"."contract_type"
AS ENUM(
  'initial',
  'renewal'
);
--> statement-breakpoint

ALTER TABLE "contracts"
ALTER COLUMN "contract_type"
SET DEFAULT 'initial'::"public"."contract_type";
--> statement-breakpoint

ALTER TABLE "contracts"
ALTER COLUMN "contract_type"
SET DATA TYPE "public"."contract_type"
USING "contract_type"::"public"."contract_type";
--> statement-breakpoint


-- ============================================================
-- EMPLOYMENT STATUS ENUM
--
-- Old terminal statuses such as EOC are now represented as:
--
-- employments.employment_status = ended
--
-- and:
--
-- employment_separations.separation_type = eoc
--
-- Preserve the existing historical EOC before converting enum.
-- ============================================================

ALTER TABLE "employments"
ALTER COLUMN "employment_status"
SET DATA TYPE text;
--> statement-breakpoint

ALTER TABLE "employments"
ALTER COLUMN "employment_status"
SET DEFAULT 'active'::text;
--> statement-breakpoint


-- ------------------------------------------------------------
-- Preserve legacy EOC information before converting
-- employment status.
--
-- cause_of_leaving is also preserved as separation.reason
-- because the column is dropped later in this migration.
-- ------------------------------------------------------------

INSERT INTO "employment_separations" (
  "employment_id",
  "separation_type",
  "status",
  "effective_date",
  "reason"
)
SELECT
  e."id",
  'eoc'::"public"."employment_separation_type",
  'completed'::"public"."employment_separation_status",
  e."end_date",
  e."cause_of_leaving"
FROM "employments" e
WHERE e."employment_status" = 'eoc'
  AND e."end_date" IS NOT NULL;
--> statement-breakpoint


-- ------------------------------------------------------------
-- Convert legacy EOC employment status to the new generic
-- terminal employment status.
-- ------------------------------------------------------------

UPDATE "employments"
SET "employment_status" = 'ended'
WHERE "employment_status" = 'eoc';
--> statement-breakpoint


DROP TYPE "public"."employment_status";
--> statement-breakpoint

CREATE TYPE "public"."employment_status"
AS ENUM(
  'pending',
  'active',
  'on_leave',
  'suspended',
  'ended'
);
--> statement-breakpoint

ALTER TABLE "employments"
ALTER COLUMN "employment_status"
SET DEFAULT 'active'::"public"."employment_status";
--> statement-breakpoint

ALTER TABLE "employments"
ALTER COLUMN "employment_status"
SET DATA TYPE "public"."employment_status"
USING "employment_status"::"public"."employment_status";
--> statement-breakpoint


-- ============================================================
-- CONTRACT MOVEMENT TYPE ENUM
--
-- New model:
--
--   initial
--   renewal
--   amendment
--
-- Promotion / demotion / transfer are now stored in
-- contract_movement_actions.
--
-- IMPORTANT:
-- Drop the old enum-based default BEFORE dropping the enum.
-- ============================================================

ALTER TABLE "contract_movements"
ALTER COLUMN "movement_type"
DROP DEFAULT;
--> statement-breakpoint

ALTER TABLE "contract_movements"
ALTER COLUMN "movement_type"
SET DATA TYPE text;
--> statement-breakpoint

DROP TYPE "public"."movement_type";
--> statement-breakpoint

CREATE TYPE "public"."movement_type"
AS ENUM(
  'initial',
  'renewal',
  'amendment'
);
--> statement-breakpoint

ALTER TABLE "contract_movements"
ALTER COLUMN "movement_type"
SET DATA TYPE "public"."movement_type"
USING "movement_type"::"public"."movement_type";
--> statement-breakpoint


-- ============================================================
-- FOREIGN KEYS
-- ============================================================

ALTER TABLE "contract_documents"
ADD CONSTRAINT "contract_documents_contract_id_contracts_id_fk"
FOREIGN KEY ("contract_id")
REFERENCES "public"."contracts"("id")
ON DELETE cascade
ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "contract_documents"
ADD CONSTRAINT "contract_documents_contract_movement_id_contract_movements_id_fk"
FOREIGN KEY ("contract_movement_id")
REFERENCES "public"."contract_movements"("id")
ON DELETE set null
ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "contract_documents"
ADD CONSTRAINT "contract_documents_file_id_files_id_fk"
FOREIGN KEY ("file_id")
REFERENCES "public"."files"("id")
ON DELETE restrict
ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "contract_movement_actions"
ADD CONSTRAINT "contract_movement_actions_contract_movement_id_contract_movements_id_fk"
FOREIGN KEY ("contract_movement_id")
REFERENCES "public"."contract_movements"("id")
ON DELETE cascade
ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "employment_separations"
ADD CONSTRAINT "employment_separations_employment_id_employments_id_fk"
FOREIGN KEY ("employment_id")
REFERENCES "public"."employments"("id")
ON DELETE cascade
ON UPDATE no action;
--> statement-breakpoint


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX "idx_contract_documents_contract"
ON "contract_documents"
USING btree ("contract_id");
--> statement-breakpoint

CREATE INDEX "idx_contract_movement_actions_movement"
ON "contract_movement_actions"
USING btree ("contract_movement_id");
--> statement-breakpoint

CREATE INDEX "idx_contract_movement_actions_type"
ON "contract_movement_actions"
USING btree ("action_type");
--> statement-breakpoint

CREATE INDEX "idx_employment_separations_employment"
ON "employment_separations"
USING btree ("employment_id");
--> statement-breakpoint

CREATE INDEX "idx_employment_separations_status"
ON "employment_separations"
USING btree ("status");
--> statement-breakpoint

CREATE INDEX "idx_employment_separations_effective_date"
ON "employment_separations"
USING btree ("effective_date");
--> statement-breakpoint


-- ============================================================
-- REMOVE LEGACY EMPLOYMENT LEAVING REASON
--
-- The historical EOC reason was already copied above into
-- employment_separations.reason.
-- ============================================================

ALTER TABLE "employments"
DROP COLUMN "cause_of_leaving";
--> statement-breakpoint


-- ============================================================
-- EMPLOYMENT DATE RANGE CHECK
-- ============================================================

ALTER TABLE "employments"
ADD CONSTRAINT "chk_employments_valid_date_range"
CHECK (
  "employments"."end_date" IS NULL
  OR "employments"."end_date" >= "employments"."start_date"
);