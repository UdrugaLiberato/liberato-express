-- AddCategorySlug
ALTER TABLE "public"."category" ADD COLUMN "slug" VARCHAR(255);

-- CreateIndex  
CREATE UNIQUE INDEX "idx_category_slug_unique" ON "public"."category"("slug");
