-- CreateTable
CREATE TABLE "public"."Manim" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "doc" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Manim_id_key" ON "public"."Manim"("id");
