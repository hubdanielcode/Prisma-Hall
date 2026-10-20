-- AlterTable
ALTER TABLE "ticket_payments" ADD COLUMN     "payment_intent_id" TEXT;

-- AlterTable
ALTER TABLE "voucher_payments" ADD COLUMN     "payment_intent_id" TEXT;
