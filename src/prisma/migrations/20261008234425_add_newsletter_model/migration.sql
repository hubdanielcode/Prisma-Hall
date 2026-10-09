-- CreateTable
CREATE TABLE "newsletters" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "is_subscribed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "newsletters_pkey" PRIMARY KEY ("user_id","email")
);

-- AddForeignKey
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
