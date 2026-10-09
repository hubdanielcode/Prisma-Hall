import { HeroSection } from "./HeroSection";

export default {
  title: "Layouts/Public/Home Page",
  component: HeroSection,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Hero = () => {
  return <HeroSection />;
};

export { Hero as "Hero Section" };
