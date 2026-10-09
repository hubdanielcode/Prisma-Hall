import { contactInformation } from "@/shared/utils/constants/contactInformation";
import { InformationPage, InformationSection } from "@/shared/components/ui/InformationPage";
import Link from "next/link";

const HelpingCentral = () => {
  return (
    <InformationPage title="Central de Ajuda">
      <InformationSection title="Conta e acesso">
        <p>Para criar a sua conta, use um e-mail do Gmail, Hotmail, Outlook ou Yahoo e uma senha de pelo menos 6 caracteres.</p>

        <p>
          Esqueceu a senha? Na tela de login, peça a redefinição e enviaremos um link para o seu e-mail. O link vale por 10 minutos, então use-o logo
          que chegar.
        </p>

        <p>Ao entrar, a opção &quot;lembrar de mim&quot; mantém você conectado por 7 dias. Sem ela, a sessão dura 2 horas.</p>

        <p>Você edita os seus dados, a foto e as preferências no seu perfil.</p>
      </InformationSection>

      <InformationSection title="Ingressos">
        <p>Os ingressos ficam disponíveis na agenda para os eventos que ainda vão acontecer. Para comprar, é preciso estar logado.</p>

        <p>Depois da compra, o pedido aparece no seu perfil, com o status do pedido e do pagamento. Você também recebe um e-mail de confirmação.</p>
      </InformationSection>

      <InformationSection title="Vouchers do bar">
        <p>Os vouchers são comprados online e retirados na casa. A quantidade de cada produto é limitada pelo estoque do bar.</p>

        <p>Quando um voucher é retirado, o pedido passa a constar como retirado e deixa de poder ser cancelado.</p>
      </InformationSection>

      <InformationSection title="Pagamento">
        <p>Aceitamos Pix, cartão de crédito, cartão de débito e dinheiro. Sobre o valor dos itens incide uma taxa de serviço de 10%.</p>
      </InformationSection>

      <InformationSection title="Cancelamentos e reembolsos">
        <p>
          Pedidos de ingressos podem ser cancelados enquanto o evento não tiver acontecido. Pedidos de vouchers podem ser cancelados enquanto nenhuma
          retirada tiver sido registrada.
        </p>

        <p>
          Os detalhes estão na{" "}
          <Link
            className="text-[#B8860B] hover:underline"
            href="/politica-de-reembolso"
          >
            Política de Reembolso
          </Link>
          .
        </p>
      </InformationSection>

      <InformationSection title="Notificações">
        <p>O sino no topo do site reúne os avisos da sua conta, como pedidos cancelados e novos eventos na agenda.</p>

        <p>No perfil, você escolhe quais avisos quer receber e se também quer recebê-los por e-mail.</p>
      </InformationSection>

      <InformationSection title="Ainda precisa de ajuda?">
        <p>
          Veja as{" "}
          <Link
            className="text-[#B8860B] hover:underline"
            href="/perguntas-frequentes"
          >
            Perguntas Frequentes
          </Link>{" "}
          ou fale com a gente:
        </p>

        <p>E-mail: {contactInformation.email}</p>

        <p>Telefone: {contactInformation.phone}</p>

        <p>Atendimento na casa: {contactInformation.openingHours}</p>
      </InformationSection>
    </InformationPage>
  );
};

export { HelpingCentral };
