/*
  Warnings:

  - You are about to drop the column `icon` on the `Amenity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Amenity" DROP COLUMN "icon",
ADD COLUMN     "description" TEXT;
