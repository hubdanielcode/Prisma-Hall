import { InformationPage, InformationSection } from "@/shared/components/ui/InformationPage";
import { contactInformation } from "@/shared/utils/constants/contactInformation";

const RefundPolicy = () => {
  return (
    <InformationPage
      title="Política de Reembolso"
      updatedAt="8 de outubro de 2026"
    >
      <InformationSection title="Pedidos de ingressos">
        <p>
          Você pode cancelar um pedido de ingressos enquanto o evento ainda não tiver acontecido. Depois que o evento acontece, o pedido não pode mais
          ser cancelado.
        </p>
      </InformationSection>

      <InformationSection title="Pedidos de vouchers do bar">
        <p>
          Você pode cancelar um pedido de vouchers enquanto nenhuma retirada tiver sido registrada. Depois da primeira retirada, o pedido não pode
          mais ser cancelado.
        </p>

        <p>Quando o pedido é cancelado, os produtos voltam para o estoque do bar.</p>
      </InformationSection>

      <InformationSection title="O que acontece com o pagamento">
        <p>
          <strong className="text-white">Pagamento confirmado:</strong> ao cancelar o pedido, o pagamento passa a constar como reembolsado.
        </p>

        <p>
          <strong className="text-white">Pagamento pendente:</strong> ao cancelar o pedido, o pagamento passa a constar como falho e não é cobrado.
        </p>

        <p>Pedidos que já foram cancelados não podem ser cancelados novamente.</p>
      </InformationSection>

      <InformationSection title="Como cancelar">
        <p>
          Entre no seu perfil, abra o pedido que deseja cancelar e escolha a opção &quot;Cancelar Pedido&quot;. Você vai ver um resumo do pedido e a
          confirmação antes de concluir. Cancelado o pedido, você recebe um aviso nas notificações do site.
        </p>
      </InformationSection>

      <InformationSection title="Prazo e forma de devolução">
        <p>Para saber o prazo e a forma como o valor volta para você, fale com a nossa equipe:</p>

        <p>E-mail: {contactInformation.email}</p>

        <p>Telefone: {contactInformation.phone}</p>
      </InformationSection>
    </InformationPage>
  );
};

export { RefundPolicy };
