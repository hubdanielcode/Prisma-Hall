import { Tailwind, Head, Body, Html, Preview, Container, Text, Button, Img, Section, Heading, Link } from "@react-email/components";

interface PasswordResetEmailProps {
  resetLink: string;
}

const PasswordResetEmail = ({ resetLink }: PasswordResetEmailProps) => {
  return (
    <div className="select-none">
      <Html>
        <Head />
        <Tailwind>
          <Preview>Redefina sua senha no Prisma Hall</Preview>

          <Body className="bg-[#0A0A0A] font-sans">
            <Container className="flex mx-auto my-10 max-w-md rounded-xl border border-[#B8860B] bg-[#1A1A1A] overflow-hidden">
              {/* - Cabeçalho do email + logo - */}

              <Section className="text-center border-b border-[#B8860B60] px-8 py-6">
                <Img
                  className="inline-block align-middle my-2"
                  src="/logo/ph-logo.png"
                  alt="PrismaHall Logo"
                  width={75}
                  height={85}
                />

                <Text className="inline-block align-middle text-white text-3xl m-0">Prisma Hall</Text>
              </Section>

              {/* - Corpo do email - */}

              <Section className="flex flex-col items-center justify-center">
                <Heading className="text-xl font-semibold text-white text-center my-6">Redefinição de senha</Heading>

                <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
                  Recebemos uma solicitação para redefinir a senha da sua conta.
                </Text>

                <Text className="text-sm text-white/60 leading-relaxed text-justify mx-4 mb-6">
                  Para sua segurança, use o botão abaixo para criar uma nova senha. Se você não reconhece esta solicitação, recomendamos que altere
                  sua senha e verifique a atividade recente da conta.
                </Text>

                <Button
                  href={resetLink}
                  className="block w-[75%] mx-auto mb-6 text-center rounded-lg border border-[#B8860B] bg-[#3D2B0A] px-5 py-3 text-sm font-semibold text-[#DDAE56]"
                >
                  Redefinir senha
                </Button>

                <Section className="text-white/40 leading-relaxed">
                  <Text className="text-xs text-center m-0 mb-2">Este link expira em 10 minutos.</Text>

                  <Text className="text-xs text-center m-0 mb-6">Se o botão não funcionar, copie e cole o endereço abaixo no seu navegador:</Text>

                  <Link
                    href={resetLink}
                    className="text-xs text-center text-[#DDAE56] break-all block m-0 mb-6"
                  >
                    {resetLink}
                  </Link>
                </Section>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    </div>
  );
};

export { PasswordResetEmail };
