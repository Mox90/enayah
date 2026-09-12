ALTER TABLE "position_items" ADD COLUMN "established_date" date;--> statement-breakpoint
CREATE INDEX "idx_position_items_established_date" ON "position_items" USING btree ("established_date");