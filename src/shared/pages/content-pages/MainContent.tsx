import { BarSection } from "@/features/bar";
import { GallerySection, EventsSection, ReviewsSection } from "@/features/events";
import { HeroSection } from "@/shared/components/layout/HeroSection";

const MainContent = () => {
  return (
    <div className="bg-black max-w-full min-h-screen">
      <HeroSection />
      <EventsSection />
      <BarSection />
      <GallerySection />
      <ReviewsSection />
    </div>
  );
};

export { MainContent };
