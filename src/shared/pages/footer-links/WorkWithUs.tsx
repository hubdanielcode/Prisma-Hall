import { contactInformation } from "@/shared/utils/constants/contactInformation";
import { InformationPage, InformationSection } from "@/shared/components/ui/InformationPage";

const WorkWithUs = () => {
  return (
    <InformationPage title="Trabalhe Conosco">
      <InformationSection title="Faça parte do Prisma Hall">
        <p>
          Se você quer trabalhar com eventos, bar, atendimento ou produção, queremos conhecer o seu perfil. A casa funciona de quinta a sábado, à
          noite, e a equipe acompanha esse ritmo.
        </p>
      </InformationSection>

      <InformationSection title="Como se candidatar">
        <p>Envie o seu currículo para {contactInformation.email}, informando no assunto a área em que você tem interesse.</p>

        <p>No e-mail, conte um pouco sobre a sua experiência e a sua disponibilidade de horários.</p>
      </InformationSection>

      <InformationSection title="Prefere falar com a gente?">
        <p>Telefone: {contactInformation.phone}</p>

        <p>
          Endereço: {contactInformation.street}, {contactInformation.city}
        </p>
      </InformationSection>
    </InformationPage>
  );
};

export { WorkWithUs };
