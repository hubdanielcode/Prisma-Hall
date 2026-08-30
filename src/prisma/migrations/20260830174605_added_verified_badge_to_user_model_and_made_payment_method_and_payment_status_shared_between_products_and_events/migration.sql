/*
  Warnings:

  - You are about to drop the column `type` on the `cart` table. All the data in the column will be lost.
  - Added the required column `item_type` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `payment_method` on the `ticket_payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ticket_payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('drinks', 'tickets');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'pix', 'creditCard', 'debitCard');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('confirmed', 'pending', 'failed');

-- AlterTable
ALTER TABLE "cart"
RENAME COLUMN "type" TO "item_type";

ALTER TABLE "cart"
ALTER COLUMN "item_type"
TYPE "ItemType"
USING ("item_type"::text::"ItemType");

-- AlterTable
ALTER TABLE "ticket_payments"
ALTER COLUMN "payment_method"
TYPE "PaymentMethod"
USING ("payment_method"::text::"PaymentMethod");

ALTER TABLE "ticket_payments"
ALTER COLUMN "status"
TYPE "PaymentStatus"
USING ("status"::text::"PaymentStatus");
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token" TEXT,
ADD COLUMN     "token_expires_at" TIMESTAMP(3);

-- DropEnum
DROP TYPE "ProductType";

-- DropEnum
DROP TYPE "TicketPaymentMethod";

-- DropEnum
DROP TYPE "TicketPaymentStatus";

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "cep" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "total_value" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "picked_up_at" TIMESTAMP(3),

    CONSTRAINT "product_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_payments" ADD CONSTRAINT "product_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
