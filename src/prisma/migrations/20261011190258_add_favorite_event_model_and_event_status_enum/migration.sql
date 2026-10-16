-- AlterEnum
ALTER TYPE "EventStatus" ADD VALUE 'cancelled';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'event_update';

-- CreateTable
CREATE TABLE "favorite_events" (
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_events_pkey" PRIMARY KEY ("user_id","event_id")
);

-- AddForeignKey
ALTER TABLE "favorite_events" ADD CONSTRAINT "favorite_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_events" ADD CONSTRAINT "favorite_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
