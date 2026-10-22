import { recalculateOldUserBadges } from "@/lib/server/badges/achievementBadges";
import { NextResponse } from "next/server";

const runtime = "nodejs";

const GET = async (request: Request) => {
  // 1. Só o cron da Vercel pode chamar essa rota. Sem a variável configurada, ninguém passa

  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const oldUserBadgesRecalculated = await recalculateOldUserBadges();

  if (!oldUserBadgesRecalculated) {
    return NextResponse.json({ error: "Falha ao recalcular os badges de tempo de conta" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
};

export { GET, runtime };
