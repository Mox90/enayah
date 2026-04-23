CREATE TYPE "public"."staff_category" AS ENUM('civilian', 'military', 'contractual');--> statement-breakpoint
CREATE TYPE "public"."workforce_category" AS ENUM('physician', 'nurse', 'allied_health', 'administrative', 'support_service');--> statement-breakpoint
ALTER TABLE "employments" ALTER COLUMN "position_item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employments" ADD COLUMN "staff_category" "staff_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "position_items" ADD COLUMN "workforce_category" "workforce_category";