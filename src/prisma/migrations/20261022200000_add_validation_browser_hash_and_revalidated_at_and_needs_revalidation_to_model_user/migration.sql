-- AlterTable
ALTER TABLE "users" ADD COLUMN     "needs_revalidation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revalidated_at" TIMESTAMP(3),
ADD COLUMN     "validation_browser_hash" TEXT,
ADD COLUMN     "validation_token" TEXT,
ADD COLUMN     "validation_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_validation_token_key" ON "users"("validation_token");