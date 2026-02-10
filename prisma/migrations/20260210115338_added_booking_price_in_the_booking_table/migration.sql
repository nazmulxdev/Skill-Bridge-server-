/*
  Warnings:

  - Added the required column `booking_price` to the `Bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "booking_price" DECIMAL(65,30) NOT NULL;
