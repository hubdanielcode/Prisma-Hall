-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('active', 'cancelled');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('active', 'cancelled');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "status" "VoucherStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "voucher_payments" ADD COLUMN     "confirmed_at" TIMESTAMP(3);
