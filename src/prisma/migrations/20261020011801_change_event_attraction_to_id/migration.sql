-- Event passa a apontar para Attraction pelo id (antes apontava pelo name)

-- 1. Coluna nova, aceitando nulo só até ser preenchida
ALTER TABLE "events" ADD COLUMN "attraction_id" TEXT;

-- 2. Preenche com o id da atração que tem o mesmo nome do evento
UPDATE "events" SET "attraction_id" = "attractions"."id" FROM "attractions" WHERE "attractions"."name" = "events"."attraction_name";

-- 3. Agora todos os eventos têm atração, então a coluna pode ser obrigatória
ALTER TABLE "events" ALTER COLUMN "attraction_id" SET NOT NULL;

-- 4. Remove a ligação antiga pelo nome
ALTER TABLE "events" DROP CONSTRAINT "events_attraction_name_fkey";
ALTER TABLE "events" DROP COLUMN "attraction_name";

-- 5. Índice e ligação nova pelo id
CREATE INDEX "events_attraction_id_idx" ON "events"("attraction_id");
ALTER TABLE "events" ADD CONSTRAINT "events_attraction_id_fkey" FOREIGN KEY ("attraction_id") REFERENCES "attractions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;