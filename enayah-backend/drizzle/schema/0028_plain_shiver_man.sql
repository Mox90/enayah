CREATE TABLE "employment_separation_reasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"separation_id" uuid NOT NULL,
	"reason_code" varchar(100) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
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
ALTER TABLE "employment_separation_reasons" ADD CONSTRAINT "employment_separation_reasons_separation_id_employment_separations_id_fk" FOREIGN KEY ("separation_id") REFERENCES "public"."employment_separations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_employment_separation_reasons_separation" ON "employment_separation_reasons" USING btree ("separation_id");--> statement-breakpoint
CREATE INDEX "idx_employment_separation_reasons_code" ON "employment_separation_reasons" USING btree ("reason_code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_employment_separation_reason" ON "employment_separation_reasons" USING btree ("separation_id","reason_code") WHERE "employment_separation_reasons"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_employment_separation_primary_reason" ON "employment_separation_reasons" USING btree ("separation_id") WHERE 
          "employment_separation_reasons"."is_deleted" = false
          AND "employment_separation_reasons"."is_primary" = true
        ;--> statement-breakpoint
CREATE INDEX "idx_employment_separations_type" ON "employment_separations" USING btree ("separation_type");