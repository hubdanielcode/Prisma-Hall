-- CreateIndex
CREATE INDEX "favorite_events_event_id_idx" ON "favorite_events"("event_id");

-- CreateIndex
CREATE INDEX "gallery_likes_image_id_idx" ON "gallery_likes"("image_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "rate_limit_expires_at_idx" ON "rate_limit"("expires_at");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "session_expires_at_idx" ON "session"("expires_at");

-- CreateIndex
CREATE INDEX "session_revoked_at_idx" ON "session"("revoked_at");

-- CreateIndex
CREATE INDEX "ticket_orders_user_id_idx" ON "ticket_orders"("user_id");

-- CreateIndex
CREATE INDEX "ticket_payments_order_id_created_at_idx" ON "ticket_payments"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "ticket_payments_user_id_idx" ON "ticket_payments"("user_id");

-- CreateIndex
CREATE INDEX "tickets_user_id_idx" ON "tickets"("user_id");

-- CreateIndex
CREATE INDEX "tickets_order_id_idx" ON "tickets"("order_id");

-- CreateIndex
CREATE INDEX "tickets_event_id_idx" ON "tickets"("event_id");

-- CreateIndex
CREATE INDEX "voucher_user_id_idx" ON "voucher"("user_id");

-- CreateIndex
CREATE INDEX "voucher_order_id_idx" ON "voucher"("order_id");

-- CreateIndex
CREATE INDEX "voucher_product_id_idx" ON "voucher"("product_id");

-- CreateIndex
CREATE INDEX "voucher_orders_user_id_idx" ON "voucher_orders"("user_id");

-- CreateIndex
CREATE INDEX "voucher_payments_order_id_created_at_idx" ON "voucher_payments"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "voucher_payments_user_id_idx" ON "voucher_payments"("user_id");
