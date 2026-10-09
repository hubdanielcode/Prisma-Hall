import { Body, Button, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Tailwind, Text } from "@react-email/components";
import { formatCurrency } from "@/shared/utils/functions/formatters";
import type { ItemType } from "@/prisma/generated/prisma/enums";

interface OrderConfirmationEmailProps {
  name: string;
  link: string;
  totalValue: number;

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

const OrderConfirmationEmail = ({ name, link, totalValue, items }: OrderConfirmationEmailProps) => {
  /* - Definições - */

  // 1. Sem a URL absoluta, a logo não carrega na caixa de entrada

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // 2. A taxa de serviço é a diferença entre o total cobrado e a soma dos itens

  const subtotal = items.reduce((accumulator, item) => accumulator + item.quantity * item.unitPrice, 0);
  const serviceFee = Math.round((totalValue - subtotal) * 100) / 100;

  return (
    <Html
      lang="pt-BR"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <Head />

      <Tailwind>
        <Preview>Recebemos o seu pedido no Prisma Hall</Preview>

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

            <Heading className="text-xl font-semibold text-white text-center mx-6 my-6">Pedido recebido</Heading>

            <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
              Olá, {name}! Recebemos o seu pedido. Confira abaixo o resumo da sua compra.
            </Text>

            {/* - Resumo do pedido - */}

            <div className="mx-6 mb-6 rounded-lg border border-[#B8860B] bg-black overflow-hidden">
              {/* - Cabeçalho do resumo - */}

              <div className="border-b border-[#B8860B60] overflow-hidden">
                <Text className="text-lg font-semibold text-white mx-5 my-5">Resumo da compra</Text>
              </div>

              {/* - Itens do pedido - */}

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

              {/* - Valores do pedido - */}

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
                    <Text className="text-sm font-semibold text-white/60 mx-5 mt-0 mb-4">Taxa de serviço</Text>
                  </Column>

                  <Column align="right">
                    <Text className="text-sm text-white mx-5 mt-0 mb-4">{formatCurrency(serviceFee)}</Text>
                  </Column>
                </Row>
              </div>

              {/* - Total - */}

              <div className="border-b border-[#B8860B60] overflow-hidden">
                <Row>
                  <Column>
                    <Text className="text-base font-semibold text-white mx-5 my-5">Total</Text>
                  </Column>

                  <Column align="right">
                    <Text className="text-lg font-semibold text-[#B8860B] mx-5 my-5">{formatCurrency(totalValue)}</Text>
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

export { OrderConfirmationEmail };
