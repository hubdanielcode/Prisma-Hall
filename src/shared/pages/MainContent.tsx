import {
  GalerySection,
  EventsSection,
  ReviewsSection,
} from "@/features/events";
import { BarSection } from "@/features/bar";
import { HeroSection } from "@/shared";

const MainContent = () => {
  return (
    <div className="bg-black max-w-full min-h-screen">
      <HeroSection />
      <EventsSection />
      <BarSection />
      <GalerySection />
      <ReviewsSection />
    </div>
  );
};

export { MainContent };
