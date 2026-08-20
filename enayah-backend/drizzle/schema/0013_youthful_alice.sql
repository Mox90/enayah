ALTER TYPE "public"."employment_status" ADD VALUE 'retired' BEFORE 'on_leave';--> statement-breakpoint
ALTER TYPE "public"."employment_status" ADD VALUE 'suspended';--> statement-breakpoint
ALTER TYPE "public"."employment_status" ADD VALUE 'deceased';