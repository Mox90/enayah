ALTER TABLE "permissions" RENAME COLUMN "name" TO "code";--> statement-breakpoint
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_name_unique";--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_code_unique" UNIQUE("code");