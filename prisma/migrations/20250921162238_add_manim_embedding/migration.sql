/*
  Warnings:

  - Added the required column `embedding` to the `Manim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Manim" ADD COLUMN     "embedding" vector(768) NOT NULL;
