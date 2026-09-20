import { Footer, Header } from "@/shared/components";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default PublicLayout;
