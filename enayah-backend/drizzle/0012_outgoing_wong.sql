ALTER TABLE "employments" ADD COLUMN "position_item_id" uuid;

ALTER TABLE "employments"
ADD CONSTRAINT "employments_position_item_id_position_items_id_fk"
FOREIGN KEY ("position_item_id")
REFERENCES "position_items"("id")
ON DELETE restrict;