import { fakeCartItems } from "@/storybook/mocks/hooks/cart/useCartItems";
import { PaymentConfirmationEmail } from "./PaymentConfirmationEmail";
import { render } from "@react-email/components";
import { serviceFee } from "@/features/cart/utils/serviceFee";
import { useEffect, useState } from "react";

export default {
  title: "Components/Emails/Templates",
  component: PaymentConfirmationEmail,
  parameters: {
    layout: "fullscreen",
  },
};

type PaymentConfirmationEmailProps = React.ComponentProps<typeof PaymentConfirmationEmail>;

/* - Montando os itens a partir do carrinho fake, do mesmo jeito que o pedido monta - */

const fakeItems: PaymentConfirmationEmailProps["items"] = fakeCartItems.map((item) => ({
  type: item.type,
  name: item.type === "tickets" ? item.event!.title : item.product!.name,
  quantity: item.quantity,
  unitPrice: item.price,
}));

const fakeSubtotal = fakeItems.reduce((accumulator, item) => accumulator + item.quantity * item.unitPrice, 0);
const fakeTotalValue = Math.round(fakeSubtotal * (1 + serviceFee) * 100) / 100;

/* - Renderizando o email em HTML, que é o que chega na caixa de entrada - */

const EmailPreview = ({ name, link, totalValue, method, items }: PaymentConfirmationEmailProps) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const generateHtml = async () => {
      const result = await render(
        <PaymentConfirmationEmail
          name={name}
          link={link}
          totalValue={totalValue}
          method={method}
          items={items}
        />,
      );

      setHtml(result);
    };
    generateHtml();
  }, [name, link, totalValue, method, items]);

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
};

const PaymentEmail = () => {
  return (
    <EmailPreview
      name="Usuário"
      link="https://prismahall.com/pedidos/id-do-pedido-fake-1"
      totalValue={fakeTotalValue}
      method="pix"
      items={fakeItems}
    />
  );
};

export { PaymentEmail as "Payment Confirmation" };
