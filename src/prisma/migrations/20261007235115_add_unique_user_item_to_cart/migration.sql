/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id]` on the table `cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,event_id]` on the table `cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cart_user_id_product_id_key" ON "cart"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_user_id_event_id_key" ON "cart"("user_id", "event_id");
