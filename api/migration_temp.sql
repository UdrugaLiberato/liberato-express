-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."answer" (
    "id" VARCHAR(255) NOT NULL,
    "location_id" VARCHAR(255),
    "answer" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "question_id" VARCHAR(255),

    CONSTRAINT "idx_16859_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "descriptionEN" TEXT,
    "descriptionHR" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_16864_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."city" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "descriptionEN" TEXT,
    "descriptionHR" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "radius_in_km" INTEGER NOT NULL,

    CONSTRAINT "idx_16869_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."image" (
    "id" SERIAL NOT NULL,
    "src" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "mime" VARCHAR(255),
    "category_id" VARCHAR(255),
    "location_id" VARCHAR(255),
    "city_id" VARCHAR(255),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_16874_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."location" (
    "id" VARCHAR(255) NOT NULL,
    "category_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "city_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "email" VARCHAR(255),
    "published" SMALLINT NOT NULL,
    "featured" SMALLINT NOT NULL,
    "about" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_16879_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question" (
    "id" VARCHAR(255) NOT NULL,
    "category_id" VARCHAR(255),
    "question" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_16884_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" VARCHAR(255) NOT NULL,
    "emailaddress" VARCHAR(255),
    "externalid" VARCHAR(255),
    "lastsigninat" BIGINT,
    "lastactiveat" BIGINT,
    "banned" BOOLEAN DEFAULT false,
    "phone" VARCHAR(180),
    "roles" TEXT NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "avatarurl" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_16889_primary" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_16859_idx_dadd4a251e27f6bf" ON "public"."answer"("question_id");

-- CreateIndex
CREATE INDEX "idx_16859_idx_dadd4a2564d218e" ON "public"."answer"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_16864_uniq_64c19c15e237e06" ON "public"."category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "idx_category_slug_unique" ON "public"."category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "idx_16869_uniq_2d5b02345e237e06" ON "public"."city"("name");

-- CreateIndex
CREATE UNIQUE INDEX "idx_city_slug_unique" ON "public"."city"("slug");

-- CreateIndex
CREATE INDEX "idx_16874_category_id" ON "public"."image"("category_id");

-- CreateIndex
CREATE INDEX "idx_16874_location_id" ON "public"."image"("location_id");

-- CreateIndex
CREATE INDEX "idx_16874_city_id" ON "public"."image"("city_id");

-- CreateIndex
CREATE INDEX "idx_16879_idx_5e9e89cb12469de2" ON "public"."location"("category_id");

-- CreateIndex
CREATE INDEX "idx_16879_idx_5e9e89cb8bac62af" ON "public"."location"("city_id");

-- CreateIndex
CREATE INDEX "idx_16879_idx_5e9e89cba76ed395" ON "public"."location"("user_id");

-- CreateIndex
CREATE INDEX "idx_16884_idx_b6f7494e12469de2" ON "public"."question"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_16889_uniq_8d93d649e7927c74" ON "public"."user"("emailaddress");

-- CreateIndex
CREATE UNIQUE INDEX "idx_16889_externalid" ON "public"."user"("externalid");

-- AddForeignKey
ALTER TABLE "public"."answer" ADD CONSTRAINT "fk_dadd4a251e27f6bf" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."answer" ADD CONSTRAINT "fk_dadd4a2564d218e" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."image" ADD CONSTRAINT "image_ibfk_1" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."image" ADD CONSTRAINT "image_ibfk_2" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."image" ADD CONSTRAINT "image_ibfk_3" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."location" ADD CONSTRAINT "fk_5e9e89cb12469de2" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."location" ADD CONSTRAINT "fk_5e9e89cb8bac62af" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."location" ADD CONSTRAINT "fk_5e9e89cba76ed395" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "fk_b6f7494e12469de2" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

