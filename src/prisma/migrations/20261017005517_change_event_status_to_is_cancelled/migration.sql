-- AlterTable
ALTER TABLE "events" ADD COLUMN "is_cancelled" BOOLEAN NOT NULL DEFAULT
false;
-- Preserva os eventos que já estavam cancelados
UPDATE "events" SET "is_cancelled" = true WHERE "status" = 'cancelled';
-- AlterTable
ALTER TABLE "events" DROP COLUMN "status";