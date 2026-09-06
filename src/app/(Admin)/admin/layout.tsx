import { checkIsAdmin } from "@/actions/admin/checkIsAdmin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const validSession = cookieStore.get("validSession");

  if (!validSession) {
    redirect("/");
  } else {
    const session = await prisma.session.findUnique({ where: { id: validSession.value } });

    if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
      redirect("/");
    } else {
      await prisma.session.update({
        where: { id: session.id },
        data: {
          lastActivityAt: new Date(),
        },
      });

      const isAdmin = await checkIsAdmin();
      if (isAdmin) {
        redirect("/admin");
      } else {
        redirect("/");
      }
    }
  }

  return <div>{children}</div>;
};

export default AdminLayout;
