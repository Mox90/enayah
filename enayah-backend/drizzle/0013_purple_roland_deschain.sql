CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"resource_id" varchar(100),
	"metadata" jsonb,
	"ip" varchar(45),
	"user_agent" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
