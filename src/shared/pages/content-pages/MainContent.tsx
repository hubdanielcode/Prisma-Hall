import { BarSection } from "@/features/bar/components/BarSection";
import {
  EventsSection,
  GallerySection,
  ReviewsSection,
} from "@/features/events";
import { HeroSection } from "../../components/layout/HeroSection";

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
