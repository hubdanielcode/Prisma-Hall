import { Footer } from "@/shared/components/layout/Footer";

export default {
  title: "Components/Shared",
  component: Footer,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const GeneralFooter = () => {
  return <Footer />;
};

export { GeneralFooter as "Footer" };
