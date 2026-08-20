ALTER TABLE "iqama_renewal_case_comments" DROP CONSTRAINT "chk_iqama_renewal_case_comment_body_not_blank";--> statement-breakpoint
DROP INDEX "idx_iqama_renewal_case_comments_case_created_at";--> statement-breakpoint
DROP INDEX "idx_iqama_renewal_case_comments_author";--> statement-breakpoint
ALTER TABLE "iqama_renewal_case_comments" ADD COLUMN "parent_comment_id" uuid;--> statement-breakpoint
ALTER TABLE "iqama_renewal_case_comments" ADD COLUMN "thread_root_id" uuid;--> statement-breakpoint
CREATE INDEX "idx_iqama_comments_case_created_at" ON "iqama_renewal_case_comments" USING btree ("case_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_iqama_comments_parent" ON "iqama_renewal_case_comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "idx_iqama_comments_thread_created_at" ON "iqama_renewal_case_comments" USING btree ("thread_root_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_iqama_comments_author" ON "iqama_renewal_case_comments" USING btree ("author_user_id");--> statement-breakpoint
ALTER TABLE "iqama_renewal_case_comments" ADD CONSTRAINT "chk_iqama_comment_body_length" CHECK (
        char_length(btrim("iqama_renewal_case_comments"."body")) between 1 and 2000
      );--> statement-breakpoint
ALTER TABLE "iqama_renewal_case_comments" ADD CONSTRAINT "chk_iqama_comment_thread_fields" CHECK (
        (
          "iqama_renewal_case_comments"."parent_comment_id" is null
          and "iqama_renewal_case_comments"."thread_root_id" is null
        )
        or
        (
          "iqama_renewal_case_comments"."parent_comment_id" is not null
          and "iqama_renewal_case_comments"."thread_root_id" is not null
        )
      );