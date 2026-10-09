import { contactInformation } from "@/shared/utils/constants/contactInformation";
import { InformationPage, InformationSection } from "@/shared/components/ui/InformationPage";
import Link from "next/link";

const TermsOfUse = () => {
  return (
    <InformationPage
      title="Termos de Uso"
      updatedAt="8 de outubro de 2026"
    >
      <InformationSection title="Aceitação">
        <p>Ao criar uma conta ou usar o site do Prisma Hall, você concorda com estes termos. Se não concordar, não use o site.</p>
      </InformationSection>

      <InformationSection title="Sua conta">
        <p>
          Você deve informationrmar dados verdadeiros no cadastro e manter a sua senha em segurança. Tudo o que for feito com a sua conta é de sua
          responsabilidade. Se perceber um uso indevido, avise a gente o quanto antes.
        </p>
      </InformationSection>

      <InformationSection title="Ingressos e vouchers">
        <p>
          Ingressos e vouchers são vinculados ao seu pedido. A disponibilidade depende da programação dos eventos e do estoque do bar, e pode mudar
          até a finalização da compra.
        </p>

        <p>Os valores exibidos no site são os dos itens. No fechamento do pedido é aplicada uma taxa de serviço de 10%.</p>
      </InformationSection>

      <InformationSection title="Cancelamentos">
        <p>
          As regras de cancelamento e reembolso estão na{" "}
          <Link
            className="text-[#B8860B] hover:underline"
            href="/politica-de-reembolso"
          >
            Política de Reembolso
          </Link>
          .
        </p>
      </InformationSection>

      <InformationSection title="Conteúdo que você publica">
        <p>
          Avaliações e curtidas devem ser verdadeiras e respeitosas. Podemos remover conteúdo que seja ofensivo, enganoso ou que desrespeite outras
          pessoas.
        </p>
      </InformationSection>

      <InformationSection title="Uso do site">
        <p>
          Não é permitido tentar acessar áreas restritas, interferir no funcionamento do site ou usá-lo para fins ilegais. Podemos suspender contas
          que descumpram estes termos.
        </p>
      </InformationSection>

      <InformationSection title="Dados pessoais">
        <p>
          O tratamento dos seus dados está descrito na{" "}
          <Link
            className="text-[#B8860B] hover:underline"
            href="/politica-de-privacidade"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </InformationSection>

      <InformationSection title="Mudanças e contato">
        <p>
          Podemos atualizar estes termos e a data no topo da página mostra a versão em vigor. Dúvidas sobre os termos podem ser enviadas para{" "}
          {contactInformation.email}.
        </p>
      </InformationSection>
    </InformationPage>
  );
};

export { TermsOfUse };
