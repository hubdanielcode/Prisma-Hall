import type { ReactNode } from "react";

interface InformationrmationPageProps {
  title: string;
  updatedAt?: string;
  children: ReactNode;
}

interface InformationSectionProps {
  title: string;
  children: ReactNode;
}

interface InformationFaqItemProps {
  question: string;
  children: ReactNode;
}

/* - Estrutura das páginas institucionais - */

const InformationPage = ({ title, updatedAt, children }: InformationrmationPageProps) => {
  return (
    <div className="flex flex-col items-center min-h-screen w-full pt-32 pb-14 px-4 bg-[#1A1A1A]">
      <div className="flex flex-col w-full max-w-3xl gap-6">
        {/* - Título - */}

        <div className="flex flex-col gap-1">
          <h1 className="text-white font-semibold text-2xl sm:text-3xl">{title}</h1>

          {updatedAt && <span className="text-white/60 text-sm">Última atualização: {updatedAt}</span>}
        </div>

        {/* - Conteúdo - */}

        <div className="flex flex-col w-full bg-black border border-[#B8860B] rounded-lg divide-y divide-[#B8860B30]">{children}</div>
      </div>
    </div>
  );
};

/* - Bloco de texto com título - */

const InformationSection = ({ title, children }: InformationSectionProps) => {
  return (
    <section className="flex flex-col gap-3 p-6">
      <h2 className="text-white font-semibold text-lg">{title}</h2>

      <div className="flex flex-col gap-2 text-white/60 text-sm leading-relaxed">{children}</div>
    </section>
  );
};

/* - Pergunta que abre e fecha para mostrar a resposta - */

const InformationFaqItem = ({ question, children }: InformationFaqItemProps) => {
  return (
    <details className="group p-6">
      <summary className="flex items-center justify-between gap-4 text-white font-semibold cursor-pointer list-none">
        <span>{question}</span>

        <span className="text-[#B8860B] text-xl transition-transform group-open:rotate-45">+</span>
      </summary>

      <div className="flex flex-col gap-2 mt-3 text-white/60 text-sm leading-relaxed">{children}</div>
    </details>
  );
};

export { InformationPage, InformationSection, InformationFaqItem };
