import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";

interface VlidateAccountEmailProps {
  name: string;
  validationLink: string;
}

const VlidateAccountEmail = ({ name, validationLink }: VlidateAccountEmailProps) => {
  /* - Definições - */

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <Html
      lang="pt-BR"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <Head />

      <Tailwind>
        <Preview>Valide a sua conta no Prisma Hall</Preview>

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

            <Heading className="text-xl font-semibold text-white text-center mx-6 my-6">Valide a sua conta</Heading>

            <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
              Olá, {name}! Falta só um passo para ativar a sua conta no Prisma Hall.
            </Text>

            <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
              Use o botão abaixo para confirmar o seu email e liberar o acesso ao site. Se você não criou uma conta no Prisma Hall, pode ignorar esta
              mensagem.
            </Text>

            <Button
              className="block w-[75%] mx-auto mb-6 text-center rounded-lg border border-[#B8860B] bg-[#3D2B0A] px-5 py-3 text-sm font-semibold text-[#DDAE56]"
              href={validationLink}
            >
              Validar conta
            </Button>

            {/* - Rodapé do email - */}

            <Text className="text-xs text-white/40 leading-relaxed text-center mx-6 mt-0 mb-2">Este link expira em 24 horas.</Text>

            <Text className="text-xs text-white/40 leading-relaxed text-center mx-6 mt-0 mb-2">
              Se o botão não funcionar, copie e cole o endereço abaixo no seu navegador:
            </Text>

            <Link
              className="text-xs text-center text-[#DDAE56] break-all block mx-6 mt-0 mb-6"
              href={validationLink}
            >
              {validationLink}
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { VlidateAccountEmail };
