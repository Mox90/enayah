ALTER TABLE "contract_movement_actions" DROP CONSTRAINT "uq_contract_movement_action";--> statement-breakpoint
ALTER TABLE "contract_movements" ALTER COLUMN "position_item_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_contract_movement_action_active" ON "contract_movement_actions" USING btree ("contract_movement_id","action_type") WHERE "contract_movement_actions"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_employment_separation_open" ON "employment_separations" USING btree ("employment_id") WHERE 
          "employment_separations"."is_deleted" = false
          AND "employment_separations"."status" IN (
            'draft',
            'pending_approval',
            'approved'
          )
        ;