-- AlterTable
ALTER TABLE "users" RENAME COLUMN "verified_user" TO "verified_user_badge";
ALTER TABLE "users" RENAME COLUMN "frequent_user" TO "frequent_user_badge";
ALTER TABLE "users" RENAME COLUMN "old_user" TO "old_user_badge";