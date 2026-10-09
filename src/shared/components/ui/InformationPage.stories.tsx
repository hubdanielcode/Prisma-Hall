import { InformationPage, InformationSection, InformationFaqItem } from "./InformationPage";

export default {
  title: "Components/Shared",
  component: InformationPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const InfoPage = () => {
  return (
    <InformationPage
      title="Título da Página"
      updatedAt="8 de outubro de 2026"
    >
      <InformationSection title="Título da Seção">
        <p>Texto de exemplo para uma seção da página institucional.</p>

        <p>Segundo parágrafo de exemplo.</p>
      </InformationSection>

      <InformationFaqItem question="Pergunta de exemplo?">
        <p>Resposta de exemplo.</p>
      </InformationFaqItem>
    </InformationPage>
  );
};

export { InfoPage as "Information Page" };
