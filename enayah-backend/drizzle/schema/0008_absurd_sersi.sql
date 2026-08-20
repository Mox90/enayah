ALTER TABLE "contract_movements" DROP CONSTRAINT "chk_job_assignments_valid_date_range";--> statement-breakpoint
ALTER TABLE "contracts" DROP CONSTRAINT "chk_contracts_valid_date_range";--> statement-breakpoint
CREATE INDEX "idx_employee_licenses_expiry_date" ON "employee_licenses" USING btree ("expiry_date") WHERE "employee_licenses"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "idx_contract_movements_type_start_date" ON "contract_movements" USING btree ("movement_type","start_date") WHERE "contract_movements"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "idx_contracts_status_end_date" ON "contracts" USING btree ("status","end_date") WHERE "contracts"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "idx_employments_hire_date_active" ON "employments" USING btree ("hire_date") WHERE "employments"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "idx_employments_status_employee" ON "employments" USING btree ("employment_status","employee_id") WHERE "employments"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "idx_position_items_status" ON "position_items" USING btree ("status") WHERE "position_items"."is_deleted" = false;--> statement-breakpoint
ALTER TABLE "contract_movements" ADD CONSTRAINT "chk_job_assignments_valid_date_range" CHECK (
      "contract_movements"."end_date" IS NULL
      OR "contract_movements"."end_date" >= "contract_movements"."start_date"
    );--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "chk_contracts_valid_date_range" CHECK (
      "contracts"."end_date" IS NULL
      OR "contracts"."end_date" >= "contracts"."start_date"
    );