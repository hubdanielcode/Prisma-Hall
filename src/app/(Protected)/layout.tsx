import { validateSession } from "@/actions";
import { Footer, Header } from "@/shared";
import { redirect } from "next/navigation";

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
