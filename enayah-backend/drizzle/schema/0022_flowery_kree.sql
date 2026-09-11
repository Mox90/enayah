ALTER TABLE "positions" ADD COLUMN "workforce_category" "workforce_category";--> statement-breakpoint
ALTER TABLE "positions" ADD COLUMN "category_code" integer;--> statement-breakpoint
CREATE INDEX "idx_positions_workforce_category" ON "positions" USING btree ("workforce_category");--> statement-breakpoint
CREATE INDEX "idx_positions_category_code" ON "positions" USING btree ("category_code");--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "chk_positions_workforce_category_code" CHECK (
        (
          "positions"."workforce_category" = 'physician'
          AND "positions"."category_code" = 1000
        )
        OR
        (
          "positions"."workforce_category" = 'nurse'
          AND "positions"."category_code" = 2000
        )
        OR
        (
          "positions"."workforce_category" = 'allied_health'
          AND "positions"."category_code" = 3000
        )
        OR
        (
          "positions"."workforce_category" = 'administrative'
          AND "positions"."category_code" = 4000
        )
        OR
        (
          "positions"."workforce_category" = 'support_service'
          AND "positions"."category_code" = 5000
        )
      );