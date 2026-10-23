import { AuthenticationContext, AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { fakeSessionUser } from "@/storybook/mocks/hooks/authentication/useSession";
import { GallerySection } from "./GallerySection";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Public/Home Page/Gallery",
  component: GallerySection,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Section = () => {
  return (
    <QueryProvider>
      <AuthenticationProvider>
        <GallerySection />
      </AuthenticationProvider>
    </QueryProvider>
  );
};

/* - Mesma seção com um admin logado: aparecem o botão de enviar foto e os botões de editar e excluir em cada foto - */

const SectionAsAdmin = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <AuthenticationContext.Provider
          value={{
            isLoading: false,
            isAuthenticated: true,
            user: { ...fakeSessionUser, role: "admin" },
            error: null,
            revokeSessionMutation: async () => true,
          }}
        >
          <GallerySection />
        </AuthenticationContext.Provider>
      </MobileProvider>
    </QueryProvider>
  );
};

export { Section as "Gallery Section" };
export { SectionAsAdmin as "Gallery Section As Admin" };
