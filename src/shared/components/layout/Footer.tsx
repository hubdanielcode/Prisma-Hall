"use client";

import { contactInformation } from "@/shared/utils/constants/contactInformation";
import { FiPhone } from "react-icons/fi";
import { GoMail } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { masks } from "../../utils/functions/masks";
import { MdAlternateEmail } from "react-icons/md";
import { motion } from "motion/react";
import { newsletterSchema } from "@/lib/validations/newsletter/newsletterSchema";
import { socialLinks } from "@/shared/utils/constants/socialLinks";
import { useNewsletter } from "@/features/newsletter/hooks/useNewsletter";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

interface FeedbackProps {
  type: "success" | "error";
  message: string;
}

const Footer = () => {
  /* - Puxando do hook - */

  const { subscribeToNewsletterMutation, isSubscribing } = useNewsletter();

  /* - Estados do email - */

  const [email, setEmail] = useState<string>("");

  /* - Estados de feedback - */

  const [feedback, setFeedback] = useState<FeedbackProps | null>(null);

  /* - Definições - */

  const appVersion = "v.1.1.0";
  const year = new Date().getFullYear();

  /* - Funções - */

  // 1. Inscreve o email na newsletter

  const handleSubscription = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const parsedSubscription = newsletterSchema.safeParse({ email });

    if (!parsedSubscription.success) {
      setFeedback({ type: "error", message: parsedSubscription.error.issues[0].message });
      return;
    }

    try {
      const result = await subscribeToNewsletterMutation(parsedSubscription.data);

      if (result === "unauthenticated") {
        setFeedback({ type: "error", message: "Entre na sua conta para se inscrever na newsletter." });
        return;
      }

      if (result === "email_mismatch") {
        setFeedback({ type: "error", message: "Use o mesmo e-mail da sua conta para se inscrever." });
        return;
      }

      if (!result) {
        setFeedback({ type: "error", message: "Não foi possível concluir a inscrição. Tente novamente." });
        return;
      }

      setEmail("");
      setFeedback({ type: "success", message: "Inscrição realizada! Você vai receber as novidades por email." });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível concluir a inscrição. Tente novamente." });
    }
  };

  return (
    <footer className="flex flex-col justify-center items-center w-full h-fit bottom-0 z-50 px-4 py-2 bg-black border-t border-[#B8860B60]">
      <div className="flex flex-col justify-center items-center my-6 text-center">
        <p className="text-xl sm:text-2xl md:text-3xl text-white font-bold my-2">Fique Por Dentro dos Próximos Eventos</p>

        <p className="my-2 text-white/60 text-xs sm:text-sm md:text-base">Receba em primeira mão promoções exclusivas e novidades!</p>
      </div>

      <form
        className="flex flex-col sm:flex-row md:flex-row justify-center items-center gap-3 sm:gap-6 flex-1 w-full sm:w-[80%] md:w-[45%] mb-4 px-4 sm:px-0"
        onSubmit={handleSubscription}
        noValidate
      >
        {/* - Input wrapper - */}

        <div className="flex w-full sm:w-[60%] md:w-[70%] h-13 bg-[#1A1A1A] border border-[#B8860B] rounded-lg text-sm text-white/60 outline-none mx-3 mb-1 sm:mb-0 md:mb-0">
          <MdAlternateEmail className="my-auto mx-3 h-4 w-4 text-[#B8860B] pointer-events-none" />

          {/* - Input de email - */}

          <input
            className="w-full bg-transparent outline-none text-white font-semibold placeholder:text-white/40 py-3"
            placeholder="Seu melhor email"
            aria-label="Email para receber novidades"
            value={email}
            onChange={(e) => setEmail(masks.email(e.target.value))}
            type="email"
          />
        </div>

        {/* - Botão de inscrever-se - */}

        <motion.button
          className="flex justify-center items-center w-full sm:w-fit md:w-fit h-13 bg-[#B8860B] hover:bg-[#7A5A08] shadow-sm shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubscribing}
          type="submit"
        >
          {isSubscribing ? "Inscrevendo..." : "Inscrever-se"}
        </motion.button>
      </form>

      {/* - Feedback da inscrição - */}

      {feedback && (
        <p
          className={`mb-4 text-sm font-semibold text-center ${feedback.type === "success" ? "text-green-400" : "text-red-500"}`}
          role="status"
        >
          {feedback.message}
        </p>
      )}

      {/* - Links - */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-4 px-6 py-4 justify-center w-full sm:w-[90%] md:w-[60%] h-fit border-t border-[#B8860B] text-sm font-semibold gap-y-8 gap-x-6">
        {/* - Primeira coluna - */}

        <div className="flex flex-col">
          <div className="flex gap-2 mr-auto sm:mr-0 md:mr-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-12 bg-linear-to-tr from-yellow-500 via-black/60 to-yellow-700 rounded-lg flex items-center justify-between shadow-xs shadow-black">
              <Image
                className="mx-auto"
                src="/logo/ph-logo.png"
                alt="PrismaHall Logo"
                width={50}
                height={50}
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 whitespace-nowrap ml-1 mr-5">
                Prisma Hall
              </h1>

              <p className="flex text-xs text-white font-semibold ml-2 mb-1">LIVE EXPERIENCE</p>
            </div>
          </div>

          <div className="flex flex-col mt-6 gap-y-1 text-white/60">
            <span>A melhor casa de shows da cidade.</span>

            <span>Experiências inesquecíveis com os melhores artistas e eventos.</span>
          </div>

          {/* - Redes sociais - */}

          <div className="flex gap-3">
            {socialLinks.map((socialLink) => {
              const Icon = socialLink.icon;

              return (
                <a
                  className="bg-[#1A1A1A] hover:bg-[#B8860B] p-3 text-white rounded-lg mt-4 cursor-pointer"
                  key={socialLink.id}
                  href={socialLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* - Segunda coluna - */}

        <div className="flex flex-col">
          <div className="flex gap-2 mr-auto sm:mr-0 md:mr-0">
            <div className="flex flex-col">
              <span className="text-white text-base font-bold">Links Rápidos</span>

              <div className="flex flex-col">
                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/#events"
                >
                  Próximos Eventos
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/agenda"
                >
                  Agenda Completa
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/#bar"
                >
                  Cardápio Bar
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/#gallery"
                >
                  Galeria de Fotos
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/agenda"
                >
                  Comprar Ingressos
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/sobre"
                >
                  Sobre Nós
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* - Terceira coluna - */}

        <div className="flex flex-col">
          <div className="flex gap-2 mr-auto sm:mr-0 md:mr-0">
            <div className="flex flex-col">
              <span className="text-white text-base font-bold">Suporte</span>

              <div className="flex flex-col">
                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/central-de-ajuda"
                >
                  Central de Ajuda
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/perguntas-frequentes"
                >
                  FAQ - Perguntas Frequentes
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/politica-de-privacidade"
                >
                  Política de Privacidade
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/termos-de-uso"
                >
                  Termos de Uso
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/politica-de-reembolso"
                >
                  Política de Reembolso
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  href="/trabalhe-conosco"
                >
                  Trabalhe Conosco
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* - Quarta coluna - */}

        <div className="flex flex-col">
          <div className="flex gap-2 mr-auto sm:mr-0 md:mr-0">
            <div className="flex flex-col">
              <span className="text-white text-base font-bold mb-3">Contato</span>

              <div className="flex flex-col gap-y-4">
                {/* - Localização - */}

                <div className="flex">
                  <IoLocationOutline className="h-5 w-5 mr-2 text-[#B8860B] shrink-0" />

                  <div className="flex flex-col text-sm text-white/60">
                    <span>{contactInformation.street}</span>

                    <span>{contactInformation.city}</span>
                  </div>
                </div>

                {/* - Telefone - */}

                <div className="flex">
                  <FiPhone className="h-5 w-5 mr-2 text-[#B8860B] shrink-0" />

                  <div className="flex flex-col text-sm text-white/60">
                    <span>{contactInformation.phone}</span>
                  </div>
                </div>

                {/* - Email para contato - */}

                <div className="flex">
                  <GoMail className="h-5 w-5 mr-2 text-[#B8860B] shrink-0" />

                  <div className="flex flex-col text-sm text-white/60">
                    <span>{contactInformation.email}</span>
                  </div>
                </div>

                {/* - Horários - */}

                <div className="flex flex-col bg-[#101010] w-full h-fit px-4 py-2 border border-[#B8860B] rounded-lg">
                  <span className="text-xs text-white/60 mb-1">Horário de Funcionamento:</span>

                  <span className="text-white font-semibold">{contactInformation.openingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* - Rodapé - */}

      <div className="flex flex-col sm:flex-row md:flex-row justify-center sm:justify-around md:justify-around items-center gap-2 sm:gap-0 w-full sm:w-[90%] md:w-[60%] border-t border-[#B8860B] text-sm text-white/60 py-4 text-center sm:text-left">
        <span>
          &copy; {year} <strong className="text-[#B8860B]">Prisma Hall</strong> Todos os direitos reservados.
        </span>

        <span>
          App desenvolvido por <strong>Daniel Lorenzo</strong> • {appVersion}
        </span>
      </div>
    </footer>
  );
};

export { Footer };
