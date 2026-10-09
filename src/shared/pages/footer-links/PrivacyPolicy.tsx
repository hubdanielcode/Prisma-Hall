import { InformationPage, InformationSection } from "@/shared/components/ui/InformationPage";
import { contactInformation } from "@/shared/utils/constants/contactInformation";

const PrivacyPolicy = () => {
  return (
    <InformationPage
      title="Política de Privacidade"
      updatedAt="8 de outubro de 2026"
    >
      <InformationSection title="Quem é o responsável">
        <p>
          O Prisma Hall é o responsável pelo tratamento dos dados pessoais tratados neste site. Para qualquer assunto sobre privacidade, fale com a
          gente em {contactInformation.email}.
        </p>
      </InformationSection>

      <InformationSection title="Quais dados coletamos">
        <p>
          <strong className="text-white">Conta:</strong> nome, e-mail e senha. A senha é guardada de forma protegida (criptografada) e nunca em texto
          aberto.
        </p>

        <p>
          <strong className="text-white">Perfil:</strong> telefone, data de nascimento, CPF, endereço e foto, quando você preenche essas
          informationrmações.
        </p>

        <p>
          <strong className="text-white">Pedidos:</strong> ingressos e vouchers comprados, forma e status do pagamento e histórico de compras.
        </p>

        <p>
          <strong className="text-white">Uso do site:</strong> avaliações, curtidas na galeria, notificações recebidas e preferências de notificação.
        </p>

        <p>
          <strong className="text-white">Newsletter:</strong> o e-mail que você informationrma no rodapé do site, vinculado à sua conta.
        </p>

        <p>
          <strong className="text-white">Sessão:</strong> um cookie necessário para manter você conectado. Ele é restrito ao navegador, não é lido por
          scripts da página e só é enviado em conexão segura.
        </p>
      </InformationSection>

      <InformationSection title="Para que usamos os dados">
        <p>
          Criar e manter a sua conta, processar pedidos de ingressos e vouchers, enviar confirmações e avisos, permitir avaliações e curtidas, enviar
          a newsletter para quem se inscreveu e proteger o acesso à sua conta.
        </p>
      </InformationSection>

      <InformationSection title="Com quem os dados passam">
        <p>Para o site funcionar, usamos serviços de terceiros que processam dados em nosso nome:</p>

        <p>Envio de e-mails (confirmação de pedido, redefinição de senha e avisos): Resend.</p>

        <p>Hospedagem do site e armazenamento das imagens enviadas: Vercel.</p>

        <p>Banco de dados: PostgreSQL, por meio do Supabase.</p>
      </InformationSection>

      <InformationSection title="Por quanto tempo guardamos">
        <p>
          Mantemos os dados da sua conta enquanto ela existir. Ao excluir a conta pelo seu perfil, removemos os dados da conta, do perfil, dos
          pedidos, das avaliações, das curtidas e das notificações.
        </p>

        <p>A sua inscrição na newsletter fica vinculada à sua conta e também é removida quando a conta é excluída.</p>
      </InformationSection>

      <InformationSection title="Os seus direitos">
        <p>
          Conforme a Lei Geral de Proteção de Dados (LGPD), você pode confirmar se tratamos os seus dados, acessá-los, corrigi-los, pedir a exclusão e
          retirar o seu consentimento. Você corrige os dados do perfil diretamente no site e exclui a conta pelas configurações do perfil.
        </p>

        <p>Para os demais pedidos, escreva para {contactInformation.email}.</p>
      </InformationSection>
    </InformationPage>
  );
};

export { PrivacyPolicy };
