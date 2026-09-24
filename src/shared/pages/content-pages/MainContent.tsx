import { BarSection } from "@/features/bar/components/BarSection";
import { EventsSection } from "@/features/events/event/components/EventsSection";
import { GallerySection } from "@/features/events/gallery/components/GallerySection";
import { HeroSection } from "@/shared/components/layout/HeroSection";
import { ReviewsSection } from "@/features/events/reviews/components/ReviewsSection";

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
