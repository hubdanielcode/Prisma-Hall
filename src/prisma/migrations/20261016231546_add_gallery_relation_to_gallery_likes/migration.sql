-- AddForeignKey
ALTER TABLE "gallery_likes" ADD CONSTRAINT "gallery_likes_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
