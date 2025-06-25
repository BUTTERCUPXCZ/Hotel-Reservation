/*
  Warnings:

  - You are about to drop the `Amenity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AmenityToRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoomImage" DROP CONSTRAINT "RoomImage_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_AmenityToRoom" DROP CONSTRAINT "_AmenityToRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_AmenityToRoom" DROP CONSTRAINT "_AmenityToRoom_B_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "amenities" TEXT,
ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "Amenity";

-- DropTable
DROP TABLE "RoomImage";

-- DropTable
DROP TABLE "_AmenityToRoom";
