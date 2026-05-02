DROP INDEX "user_role_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_unique_no_dept" ON "user_roles" USING btree ("user_id","role_id") WHERE "user_roles"."department_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_unique" ON "user_roles" USING btree ("user_id","role_id","department_id") WHERE "user_roles"."department_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "chk_contracts_valid_date_range" CHECK ("contracts"."end_date" IS NULL OR "contracts"."end_date" >= "contracts"."start_date");