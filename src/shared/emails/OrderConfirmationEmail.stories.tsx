import { fakeCartItems } from "../../../.storybook/mocks/hooks/cart/useCartItems";
import { OrderConfirmationEmail } from "./OrderConfirmationEmail";
import { render } from "@react-email/components";
import { serviceFee } from "@/features/cart/utils/serviceFee";
import { useEffect, useState } from "react";

export default {
  title: "Components/Emails/Templates",
  component: OrderConfirmationEmail,
  parameters: {
    layout: "fullscreen",
  },
};

type OrderConfirmationEmailProps = React.ComponentProps<typeof OrderConfirmationEmail>;

/* - Montando os itens a partir do carrinho fake, do mesmo jeito que o checkout monta - */

const fakeItems: OrderConfirmationEmailProps["items"] = fakeCartItems.map((item) => ({
  type: item.type,
  name: item.type === "tickets" ? item.event!.title : item.product!.name,
  quantity: item.quantity,
  unitPrice: item.price,
}));

const fakeSubtotal = fakeItems.reduce((accumulator, item) => accumulator + item.quantity * item.unitPrice, 0);
const fakeTotalValue = Math.round(fakeSubtotal * (1 + serviceFee) * 100) / 100;

/* - Renderizando o email em HTML, que é o que chega na caixa de entrada - */

const EmailPreview = ({ name, link, totalValue, items }: OrderConfirmationEmailProps) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const generateHtml = async () => {
      const result = await render(
        <OrderConfirmationEmail
          name={name}
          link={link}
          totalValue={totalValue}
          items={items}
        />,
      );

      setHtml(result);
    };
    generateHtml();
  }, [name, link, totalValue, items]);

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
};

const OrderEmail = () => {
  return (
    <EmailPreview
      name="Usuário"
      link="https://prismahall.com/pedidos/id-do-pedido-fake-1"
      totalValue={fakeTotalValue}
      items={fakeItems}
    />
  );
};

export { OrderEmail as "Order Confirmation" };
