-- drizzle/schema/0023_tense_natasha_romanoff.sql

-- No-op migration.
--
-- 0022 was corrected to create workforce_category and category_code
-- as nullable columns for existing position records.
--
-- Therefore the DROP NOT NULL operations originally generated
-- in this migration are no longer necessary.

SELECT 1;