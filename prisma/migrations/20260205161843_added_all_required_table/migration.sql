/*
  Warnings:

  - A unique constraint covering the columns `[timeSlotId]` on the table `Bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timeSlotId` to the `Bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "timeSlotId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorTimeSlot" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Education_tutorProfileId_idx" ON "Education"("tutorProfileId");

-- CreateIndex
CREATE INDEX "TutorTimeSlot_tutorProfileId_date_idx" ON "TutorTimeSlot"("tutorProfileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TutorTimeSlot_tutorProfileId_date_startTime_key" ON "TutorTimeSlot"("tutorProfileId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Bookings_timeSlotId_key" ON "Bookings"("timeSlotId");

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TutorTimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorTimeSlot" ADD CONSTRAINT "TutorTimeSlot_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
