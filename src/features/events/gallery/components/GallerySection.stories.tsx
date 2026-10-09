import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { GallerySection } from "./GallerySection";
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

export { Section as "Gallery Section" };
