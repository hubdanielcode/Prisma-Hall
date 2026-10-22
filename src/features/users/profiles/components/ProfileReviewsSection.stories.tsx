import { MobileProvider } from "@/shared/context/MobileContext";
import { ProfileReviewsSection } from "./ProfileReviewsSection";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export default {
  title: "Layouts/Protected/Profile/Sections",
  component: ProfileReviewsSection,
  parameters: {
    layout: "fullscreen",
  },
};

const ProfileReviewsTab = () => {
  return (
    <QueryProvider>
      <MobileProvider>
        <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
          <ProfileReviewsSection />
        </div>
      </MobileProvider>
    </QueryProvider>
  );
};

export { ProfileReviewsTab as "Profile Reviews Section" };
