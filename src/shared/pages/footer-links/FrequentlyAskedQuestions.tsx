import { InformationFaqItem, InformationPage } from "@/shared/components/ui/InformationPage";
import Link from "next/link";

const FrequentlyAskedQuestions = () => {
  return (
    <InformationPage title="Perguntas Frequentes">
      <InformationFaqItem question="Preciso de conta para comprar?">
        <p>Sim. Para adicionar itens ao carrinho e finalizar a compra, você precisa estar logado.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Posso me cadastrar com qualquer e-mail?">
        <p>O cadastro aceita e-mails do Gmail, Hotmail, Outlook e Yahoo.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Esqueci a minha senha. E agora?">
        <p>Na tela de login, peça a redefinição de senha. Você recebe um link por e-mail que vale por 10 minutos.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Quais formas de pagamento vocês aceitam?">
        <p>Pix, cartão de crédito, cartão de débito e dinheiro.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Existe taxa de serviço?">
        <p>Sim. É aplicada uma taxa de serviço de 10% sobre o valor dos itens do pedido.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Onde vejo os meus ingressos e vouchers?">
        <p>No seu perfil, na seção de pedidos. Lá você acompanha o status do pedido, o status do pagamento e se a retirada já foi feita.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Como funciona o voucher do bar?">
        <p>Você compra o voucher online e retira o produto na casa. Enquanto não houver retirada registrada, o pedido ainda pode ser cancelado.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Posso cancelar um pedido?">
        <p>
          Pedidos de ingressos podem ser cancelados até o evento acontecer. Pedidos de vouchers podem ser cancelados até a primeira retirada. Pedidos
          já cancelados não podem ser cancelados de novo.
        </p>
      </InformationFaqItem>

      <InformationFaqItem question="O que acontece com o pagamento se eu cancelar?">
        <p>
          Um pagamento confirmado passa a constar como reembolsado. Um pagamento pendente passa a constar como falho e não é cobrado. Mais detalhes na{" "}
          <Link
            className="text-[#B8860B] hover:underline"
            href="/politica-de-reembolso"
          >
            Política de Reembolso
          </Link>
          .
        </p>
      </InformationFaqItem>

      <InformationFaqItem question="Como recebo avisos de novos eventos?">
        <p>
          Ative as notificações de promoções no seu perfil e os novos eventos aparecem no sino do site. Se ativar também as notificações por e-mail,
          os avisos chegam na sua caixa de entrada. Você também pode se inscrever na newsletter pelo rodapé.
        </p>
      </InformationFaqItem>

      <InformationFaqItem question="Posso avaliar um evento e curtir fotos da galeria?">
        <p>Sim, com a sua conta logada. As avaliações aparecem na página inicial e as curtidas ficam registradas na galeria.</p>
      </InformationFaqItem>

      <InformationFaqItem question="Como excluo a minha conta?">
        <p>No seu perfil, na seção de configurações, existe a opção de excluir a conta. Ao excluir, os dados da conta são removidos.</p>
      </InformationFaqItem>
    </InformationPage>
  );
};

export { FrequentlyAskedQuestions };
