import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { MobileProvider } from "@/shared/context/MobileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { ReviewsSection } from "./ReviewsSection";

export default {
  title: "Layouts/Public/Home Page/Reviews",
  component: ReviewsSection,
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
        <MobileProvider>
          <ReviewsSection />
        </MobileProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Section as "Reviews Section" };
