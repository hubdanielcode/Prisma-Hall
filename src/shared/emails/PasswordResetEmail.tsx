import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";

interface PasswordResetEmailProps {
  resetLink: string;
}

const PasswordResetEmail = ({ resetLink }: PasswordResetEmailProps) => {
  /* - Definições - */

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <Html
      lang="pt-BR"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <Head />

      <Tailwind>
        <Preview>Redefina sua senha no Prisma Hall</Preview>

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

            <Heading className="text-xl font-semibold text-white text-center mx-6 my-6">Redefinição de senha</Heading>

            <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
              Recebemos uma solicitação para redefinir a senha da sua conta.
            </Text>

            <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
              Para sua segurança, use o botão abaixo para criar uma nova senha. Se você não reconhece esta solicitação, recomendamos que altere sua
              senha e verifique a atividade recente da conta.
            </Text>

            <Button
              className="block w-[75%] mx-auto mb-6 text-center rounded-lg border border-[#B8860B] bg-[#3D2B0A] px-5 py-3 text-sm font-semibold text-[#DDAE56]"
              href={resetLink}
            >
              Redefinir senha
            </Button>

            {/* - Rodapé do email - */}

            <Text className="text-xs text-white/40 leading-relaxed text-center mx-6 mt-0 mb-2">Este link expira em 10 minutos.</Text>

            <Text className="text-xs text-white/40 leading-relaxed text-center mx-6 mt-0 mb-2">
              Se o botão não funcionar, copie e cole o endereço abaixo no seu navegador:
            </Text>

            <Link
              className="text-xs text-center text-[#DDAE56] break-all block mx-6 mt-0 mb-6"
              href={resetLink}
            >
              {resetLink}
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { PasswordResetEmail };
