DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.tables
		WHERE table_schema = 'public'
			AND table_name = 'SpellReferenceMissing'
	) THEN
		ALTER TABLE "SpellReferenceMissing" ALTER COLUMN "updated_at" DROP DEFAULT;
	END IF;
END $$;
