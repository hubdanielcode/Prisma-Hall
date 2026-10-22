import { fakeCartItems } from "@/storybook/mocks/hooks/cart/useCartItems";
import { RefundConfirmationEmail } from "./RefundConfirmationEmail";
import { render } from "@react-email/components";
import { serviceFee } from "@/features/cart/utils/serviceFee";
import { useEffect, useState } from "react";

export default {
  title: "Components/Emails/Templates",
  component: RefundConfirmationEmail,
  parameters: {
    layout: "fullscreen",
  },
};

type RefundConfirmationEmailProps = React.ComponentProps<typeof RefundConfirmationEmail>;

/* - Montando os itens a partir do carrinho fake, do mesmo jeito que o pedido monta - */

const fakeItems: RefundConfirmationEmailProps["items"] = fakeCartItems.map((item) => ({
  type: item.type,
  name: item.type === "tickets" ? item.event!.title : item.product!.name,
  quantity: item.quantity,
  unitPrice: item.price,
}));

const fakeSubtotal = fakeItems.reduce((accumulator, item) => accumulator + item.quantity * item.unitPrice, 0);
const fakeRefundedValue = Math.round(fakeSubtotal * (1 + serviceFee) * 100) / 100;

/* - Renderizando o email em HTML, que é o que chega na caixa de entrada - */

const EmailPreview = ({ name, link, refundedValue, method, items }: RefundConfirmationEmailProps) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const generateHtml = async () => {
      const result = await render(
        <RefundConfirmationEmail
          name={name}
          link={link}
          refundedValue={refundedValue}
          method={method}
          items={items}
        />,
      );

      setHtml(result);
    };
    generateHtml();
  }, [name, link, refundedValue, method, items]);

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
};

const RefundEmail = () => {
  return (
    <EmailPreview
      name="Usuário"
      link="https://prismahall.com/pedidos/id-do-pedido-fake-1"
      refundedValue={fakeRefundedValue}
      method="pix"
      items={fakeItems}
    />
  );
};

export { RefundEmail as "Refund Confirmation" };
