import { Body, Button, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Tailwind, Text } from "@react-email/components";
import { formatCurrency } from "../utils/functions/formatters";
import type { ItemType, PaymentMethod } from "@/prisma/generated/prisma/enums";

interface RefundConfirmationEmailProps {
  name: string;
  link: string;
  refundedValue: number;
  method: PaymentMethod;

  items: {
    type: ItemType;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}

const itemTypeLabels: Record<ItemType, string> = {
  tickets: "Ingresso",
  drinks: "Drink",
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "Pix",
  creditCard: "Cartão de crédito",
  debitCard: "Cartão de débito",
  cash: "Dinheiro",
};

const RefundConfirmationEmail = ({ name, link, refundedValue, method, items }: RefundConfirmationEmailProps) => {
  /* - Definições - */

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const subtotal = items.reduce((accumulator, item) => accumulator + item.quantity * item.unitPrice, 0);
  const serviceFee = Math.round((refundedValue - subtotal) * 100) / 100;

  return (
    <Html
      lang="pt-BR"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <Head />

      <Tailwind>
        <Preview>Reembolso confirmado no Prisma Hall</Preview>

        <Body className="bg-[#0A0A0A] font-sans">
          <Container className="flex mx-auto my-6 max-w-md rounded-xl border border-[#B8860B] bg-[#1A1A1A] overflow-hidden">
            {/* - Cabeçalho do email + logo - */}

            <Section className="text-center border-b border-[#B8860B60] px-8 py-6">
              <Img
                className="inline-block align-middle my-2"
                src={`${appUrl}/logo/ph-logo.png`}
                alt="PrismaHall Logo"
                width={75}
                height={75}
              />

              <Text className="inline-block align-middle text-white text-3xl m-0">Prisma Hall</Text>
            </Section>

            {/* - Corpo do email - */}

            <Heading className="text-xl font-semibold text-white text-center mx-6 my-6">Reembolso confirmado</Heading>

            <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
              Olá, {name}! O reembolso do seu pedido foi realizado. Confira abaixo o resumo do que foi devolvido.
            </Text>

            {/* - Resumo do reembolso - */}

            <div className="mx-6 mb-6 rounded-lg border border-[#B8860B] bg-black overflow-hidden">
              {/* - Cabeçalho do resumo - */}

              <div className="border-b border-[#B8860B60] overflow-hidden">
                <Text className="text-lg font-semibold text-white mx-5 my-5">Resumo do reembolso</Text>
              </div>

              {/* - Itens reembolsados - */}

              <div className="border-b border-[#B8860B60] overflow-hidden">
                {items.map((item, index) => (
                  <Row key={`${item.name}-${index}`}>
                    <Column>
                      <Text className="text-xs font-bold text-[#B8860B] uppercase mx-5 mt-4 mb-0">{itemTypeLabels[item.type]}</Text>

                      <Text className="text-sm font-semibold text-white mx-5 mt-0 mb-4">{item.name}</Text>
                    </Column>

                    <Column align="right">
                      <Text className="text-xs text-white/60 mx-5 mt-4 mb-0">
                        {item.quantity}x {formatCurrency(item.unitPrice)}
                      </Text>

                      <Text className="text-sm font-semibold text-white mx-5 mt-0 mb-4">{formatCurrency(item.quantity * item.unitPrice)}</Text>
                    </Column>
                  </Row>
                ))}
              </div>

              {/* - Valores do reembolso - */}

              <div className="border-b border-[#B8860B60] overflow-hidden">
                <Row>
                  <Column>
                    <Text className="text-sm font-semibold text-white/60 mx-5 mt-4 mb-1">Subtotal</Text>
                  </Column>

                  <Column align="right">
                    <Text className="text-sm text-white mx-5 mt-4 mb-1">{formatCurrency(subtotal)}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <Text className="text-sm font-semibold text-white/60 mx-5 mt-0 mb-1">Taxa de serviço</Text>
                  </Column>

                  <Column align="right">
                    <Text className="text-sm text-white mx-5 mt-0 mb-1">{formatCurrency(serviceFee)}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <Text className="text-sm font-semibold text-white/60 mx-5 mt-0 mb-4">Devolvido em</Text>
                  </Column>

                  <Column align="right">
                    <Text className="text-sm text-white mx-5 mt-0 mb-4">{paymentMethodLabels[method]}</Text>
                  </Column>
                </Row>
              </div>

              {/* - Total reembolsado - */}

              <div className="border-b border-[#B8860B60] overflow-hidden">
                <Row>
                  <Column>
                    <Text className="text-base font-semibold text-white mx-5 my-5">Total reembolsado</Text>
                  </Column>

                  <Column align="right">
                    <Text className="text-lg font-semibold text-[#B8860B] mx-5 my-5">{formatCurrency(refundedValue)}</Text>
                  </Column>
                </Row>
              </div>

              {/* - Botão - */}

              <div className="overflow-hidden">
                <Button
                  className="block w-[75%] mx-auto my-5 text-center rounded-lg border border-[#B8860B] bg-[#3D2B0A] px-5 py-3 text-sm font-semibold text-[#DDAE56]"
                  href={link}
                >
                  Ver pedido
                </Button>
              </div>
            </div>

            {/* - Rodapé do email - */}

            <Text className="text-xs text-white/40 leading-relaxed text-center mx-6 mt-0 mb-2">
              O valor volta pela mesma forma de pagamento da compra. O prazo para aparecer na sua conta ou fatura depende do seu banco ou operadora.
            </Text>

            <Text className="text-xs text-white/40 leading-relaxed text-center mx-6 mt-0 mb-2">
              Se o botão não funcionar, acesse a sua conta no Prisma Hall e abra o seu perfil para ver os seus pedidos.
            </Text>

            <Link
              className="text-xs text-center text-[#DDAE56] break-all block mx-6 mt-0 mb-6"
              href={appUrl}
            >
              {appUrl}
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { RefundConfirmationEmail };
