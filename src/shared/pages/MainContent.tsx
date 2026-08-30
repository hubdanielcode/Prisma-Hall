import { GallerySection, EventsSection, ReviewsSection } from "@/features/events";
import { BarSection } from "@/features/bar";
import { HeroSection } from "@/shared";

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
