import { prisma } from "@/lib/prisma";
import { Footer, Header } from "@/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const validSession = cookieStore.get("validSession");

  if (!validSession) {
    redirect("/");
  } else {
    const session = await prisma.session.findUnique({ where: { id: validSession.value } });

    if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
      redirect("/");
    }
    await prisma.session.update({
      where: { id: session.id },
      data: {
        lastActivityAt: new Date(),
      },
    });
  }

  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
