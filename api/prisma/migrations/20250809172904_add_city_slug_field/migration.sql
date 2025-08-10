/*
  Warnings:

  - You are about to drop the column `description` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `clerk_id` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `city` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."idx_16889_clerk_id_unique";

-- AlterTable
ALTER TABLE "public"."category" DROP COLUMN "description",
ADD COLUMN     "descriptionEN" TEXT,
ADD COLUMN     "descriptionHR" TEXT;

-- AlterTable
ALTER TABLE "public"."city" ADD COLUMN     "slug" VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."image" ADD COLUMN     "city_id" VARCHAR(255),
ADD COLUMN     "deleted_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "clerk_id";

-- CreateIndex
CREATE UNIQUE INDEX "idx_city_slug_unique" ON "public"."city"("slug");

-- CreateIndex
CREATE INDEX "idx_16874_city_id" ON "public"."image"("city_id");

-- AddForeignKey
ALTER TABLE "public"."image" ADD CONSTRAINT "image_ibfk_3" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
