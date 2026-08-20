ALTER TABLE "employee_identifications" RENAME COLUMN "file_id" TO "document_file_id";--> statement-breakpoint
ALTER TABLE "employee_visas" RENAME COLUMN "file_id" TO "document_file_id";--> statement-breakpoint
ALTER TABLE "employee_boards" DROP CONSTRAINT "employee_boards_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_cpd_records" DROP CONSTRAINT "employee_cpd_records_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_fellowships" DROP CONSTRAINT "employee_fellowships_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_licenses" DROP CONSTRAINT "employee_licenses_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_life_support_certifications" DROP CONSTRAINT "employee_life_support_certifications_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_malpractice_insurance" DROP CONSTRAINT "employee_malpractice_insurance_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_memberships" DROP CONSTRAINT "employee_memberships_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_training_records" DROP CONSTRAINT "employee_training_records_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_identifications" DROP CONSTRAINT "employee_identifications_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_visas" DROP CONSTRAINT "employee_visas_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_dependents" ADD COLUMN "document_file_id" uuid;--> statement-breakpoint
ALTER TABLE "employee_boards" ADD CONSTRAINT "employee_boards_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_cpd_records" ADD CONSTRAINT "employee_cpd_records_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_fellowships" ADD CONSTRAINT "employee_fellowships_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_licenses" ADD CONSTRAINT "employee_licenses_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_life_support_certifications" ADD CONSTRAINT "employee_life_support_certifications_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_malpractice_insurance" ADD CONSTRAINT "employee_malpractice_insurance_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_memberships" ADD CONSTRAINT "employee_memberships_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_training_records" ADD CONSTRAINT "employee_training_records_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_dependents" ADD CONSTRAINT "employee_dependents_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_identifications" ADD CONSTRAINT "employee_identifications_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_visas" ADD CONSTRAINT "employee_visas_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_employee_identification_document_file_id" ON "employee_identifications" USING btree ("document_file_id");