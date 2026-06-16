ALTER TABLE "class"
ADD COLUMN IF NOT EXISTS "created_by_id" uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'FK_class_created_by'
  ) THEN
    ALTER TABLE "class"
    ADD CONSTRAINT "FK_class_created_by"
    FOREIGN KEY ("created_by_id")
    REFERENCES "users"("id")
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IDX_class_created_by_id"
ON "class" ("created_by_id");
