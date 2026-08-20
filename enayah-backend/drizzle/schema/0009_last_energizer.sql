CREATE TABLE "iqama_renewal_case_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"status_at_time" "iqama_renewal_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_iqama_renewal_case_comment_body_not_blank" CHECK (
        length(trim("iqama_renewal_case_comments"."body")) between 1 and 2000
      )
);
--> statement-breakpoint
ALTER TABLE "iqama_renewal_case_comments" ADD CONSTRAINT "iqama_renewal_case_comments_case_id_iqama_renewal_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."iqama_renewal_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iqama_renewal_case_comments" ADD CONSTRAINT "iqama_renewal_case_comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_iqama_renewal_case_comments_case_created_at" ON "iqama_renewal_case_comments" USING btree ("case_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_iqama_renewal_case_comments_author" ON "iqama_renewal_case_comments" USING btree ("author_user_id");