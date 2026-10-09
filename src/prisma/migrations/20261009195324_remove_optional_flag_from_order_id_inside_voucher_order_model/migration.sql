/*
  Warnings:

  - Made the column `order_id` on table `voucher_payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "voucher_payments" DROP CONSTRAINT "voucher_payments_order_id_fkey";

-- AlterTable
ALTER TABLE "voucher_payments" ALTER COLUMN "order_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "voucher_payments" ADD CONSTRAINT "voucher_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "voucher_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
