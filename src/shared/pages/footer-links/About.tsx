import { contactInformation } from "@/shared/utils/constants/contactInformation";
import { InformationPage, InformationSection } from "@/shared/components/ui/InformationPage";

const About = () => {
  return (
    <InformationPage title="Sobre Nós">
      <InformationSection title="Quem somos">
        <p>
          O Prisma Hall é uma casa de shows em Salvador - BA que reúne programação ao vivo e bar no mesmo lugar. A nossa proposta é simples: boas
          atrações, boa estrutura e uma experiência que você queira repetir.
        </p>
      </InformationSection>

      <InformationSection title="O que você encontra aqui">
        <p>
          <strong className="text-white">Agenda de eventos.</strong> Consulte os próximos shows e filtre por gênero musical: Trap & Hip Hop, Forró,
          Samba & Pagode, Metal, Eletrônica, Funk, Rock e Pop.
        </p>

        <p>
          <strong className="text-white">Ingressos online.</strong> Escolha o evento, monte o seu pedido e acompanhe tudo pelo seu perfil.
        </p>

        <p>
          <strong className="text-white">Bar.</strong> Cervejas, coquetéis, drinks e opções sem álcool. Você pode comprar os vouchers antes e retirar
          na casa.
        </p>

        <p>
          <strong className="text-white">Galeria e avaliações.</strong> Veja as fotos dos eventos que já aconteceram, curta as suas favoritas e conte
          como foi a sua noite.
        </p>
      </InformationSection>

      <InformationSection title="Onde estamos">
        <p>
          {contactInformation.street}, {contactInformation.city}
        </p>

        <p>Funcionamento: {contactInformation.openingHours}</p>
      </InformationSection>
    </InformationPage>
  );
};

export { About };
