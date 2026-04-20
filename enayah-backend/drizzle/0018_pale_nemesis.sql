ALTER TABLE "users" ADD COLUMN "mfa_secret_cipher" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_secret_iv" varchar(24);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_secret_tag" varchar(24);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_enabled_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_disabled_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_mfa_enabled_requires_secret" CHECK ("users"."mfa_enabled" = false OR "users"."mfa_secret" IS NOT NULL);