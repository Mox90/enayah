ALTER TABLE "files" RENAME COLUMN "file_name" TO "stored_name";--> statement-breakpoint
ALTER TABLE "files" RENAME COLUMN "storage_path" TO "storage_key";--> statement-breakpoint
ALTER TABLE "files" RENAME COLUMN "checksum" TO "checksum_sha256";--> statement-breakpoint
ALTER TABLE "employee_degrees" DROP CONSTRAINT "employee_degrees_document_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "avatar_file_id" uuid;--> statement-breakpoint
ALTER TABLE "employee_degrees" ADD CONSTRAINT "employee_degrees_document_file_id_files_id_fk" FOREIGN KEY ("document_file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_avatar_file_id_files_id_fk" FOREIGN KEY ("avatar_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_files_storage_key" ON "files" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "idx_files_checksum_sha256" ON "files" USING btree ("checksum_sha256");--> statement-breakpoint
CREATE INDEX "idx_employees_avatar_file_id" ON "employees" USING btree ("avatar_file_id");--> statement-breakpoint
CREATE INDEX "idx_employees_country_id" ON "employees" USING btree ("country_id");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "chk_files_file_size" CHECK (
        "files"."file_size" > 0
        AND "files"."file_size" <= 2097152
      );