import { Footer, Header } from "@/shared/components";
import { redirect } from "next/navigation";
import { validateSession } from "@/actions/session/validateSession";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const validatedSession = await validateSession();

  if (!validatedSession) {
    redirect("/");
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
