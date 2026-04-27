ALTER TABLE "audit_logs" ADD COLUMN "before" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "after" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "success" boolean;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "request_id" varchar(100);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "module" varchar(50);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "reviewed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "hash" text;