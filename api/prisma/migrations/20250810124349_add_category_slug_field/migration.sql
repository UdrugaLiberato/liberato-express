-- AddCategorySlug (only if column doesn't exist)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'category' AND column_name = 'slug' AND table_schema = 'public') THEN
    ALTER TABLE "public"."category" ADD COLUMN "slug" VARCHAR(255);
  END IF;
END $$;

-- CreateIndex (only if index doesn't exist)  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_category_slug_unique' AND n.nspname = 'public') THEN
    CREATE UNIQUE INDEX "idx_category_slug_unique" ON "public"."category"("slug");
  END IF;
END $$;
