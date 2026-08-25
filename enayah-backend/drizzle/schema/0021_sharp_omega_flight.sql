-- 1. Add the new columns as nullable first
ALTER TABLE "notifications"
ADD COLUMN "title_ar" varchar(255);

ALTER TABLE "notifications"
ADD COLUMN "message_ar" text;

-- 2. Backfill existing notifications
--
-- Existing historical notifications do not have Arabic translations,
-- so use the English content as a safe fallback.
UPDATE "notifications"
SET
  "title_ar" = "title",
  "message_ar" = "message"
WHERE
  "title_ar" IS NULL
  OR "message_ar" IS NULL;

-- 3. Now make them required
ALTER TABLE "notifications"
ALTER COLUMN "title_ar" SET NOT NULL;

ALTER TABLE "notifications"
ALTER COLUMN "message_ar" SET NOT NULL;