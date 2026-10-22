/*
  Warnings:

  - A unique constraint covering the columns `[validation_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "validation_token" TEXT,
ADD COLUMN     "validation_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_validation_token_key" ON "users"("validation_token");
