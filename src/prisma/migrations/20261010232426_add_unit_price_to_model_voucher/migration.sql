/*
  Warnings:

  - Added the required column `unit_price` to the `voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "unit_price" DECIMAL(65,30) NOT NULL;
