/*
  Warnings:

  - You are about to drop the column `scheduleId` on the `Participants` table. All the data in the column will be lost.
  - The `abscence` column on the `Participants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Schedules` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `eventId` to the `Participants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "Schedules" DROP CONSTRAINT "Schedules_eventId_fkey";

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "candidates" TIMESTAMP(3)[];

-- AlterTable
ALTER TABLE "Participants" DROP COLUMN "scheduleId",
ADD COLUMN     "eventId" INTEGER NOT NULL,
DROP COLUMN "abscence",
ADD COLUMN     "abscence" BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- DropTable
DROP TABLE "Schedules";

-- CreateTable
CREATE TABLE "UsersEvents" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "UsersEvents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersEvents" ADD CONSTRAINT "UsersEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersEvents" ADD CONSTRAINT "UsersEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
