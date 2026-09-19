-- AlterTable
ALTER TABLE "users" ALTER COLUMN "photo" DROP NOT NULL,
ALTER COLUMN "verified_user" SET DEFAULT false;
