import { useAuthenticationContext } from "@/features/authentication";
import { MdAlternateEmail } from "react-icons/md";
import { motion } from "framer-motion";
import { masks } from "../utils/masks";
import { Link, useNavigate } from "react-router-dom";
import PrismaHall from "../../../public/ph-logo.png";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
import { GoMail } from "react-icons/go";

const Footer = () => {
  /* - Puxando do context - */

  const { email, setEmail } = useAuthenticationContext();

  /* - Definições - */

  const navigate = useNavigate();
  const appVersion = "v.1.0.0";

  /* - Funções - */

  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-col justify-center items-center w-full h-fit bottom-0 z-50 px-4 py-2 bg-black border-t border-[#B8860B60]">
      <div className="flex flex-col justify-center items-center my-6 text-center">
        <p className="text-xl sm:text-2xl md:text-3xl text-white font-bold my-2">
          Fique Por Dentro dos Próximos Eventos
        </p>

        <p className="my-2 text-white/60 text-xs sm:text-sm md:text-base">
          Receba em primeira mão promoções exclusivas e novidades!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-row justify-center items-center gap-3 sm:gap-6 flex-1 w-full sm:w-[80%] md:w-[45%] mb-4 px-4 sm:px-0">
        {/* - Input wrapper - */}

        <div className="flex w-full sm:w-[60%] md:w-[70%] h-13 bg-[#1A1A1A] border border-[#B8860B] rounded-lg text-sm text-white/60 outline-none mx-3 mb-1 sm:mb-0 md:mb-0">
          <MdAlternateEmail className="my-auto mx-3 h-4 w-4 text-[#B8860B] pointer-events-none" />

          {/* - Input de email - */}

          <input
            className="w-full bg-transparent outline-none text-white font-semibold placeholder:text-white/40 py-3"
            placeholder="Seu melhor email"
            value={email}
            onChange={(e) => setEmail(masks.email(e.target.value))}
            type="text"
          />
        </div>

        {/* - Botão - */}

        <motion.button
          className="flex justify-center items-center w-full sm:w-fit md:w-fit h-13 bg-[#B8860B] hover:bg-[#7A5A08] shadow-sm shadow-[#B8860B] hover:shadow-[#7A5A08] text-black font-semibold px-4 py-2 rounded-lg cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span
            className="flex items-center"
            onClick={() => {
              navigate("/");
            }}
          >
            Inscrever-se
          </span>
        </motion.button>
      </div>

      {/* - Links - */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-4 px-6 py-4 justify-center w-full sm:w-[90%] md:w-[60%] h-fit border-t border-[#B8860B] text-sm font-semibold gap-y-8 gap-x-6">
        {/* - Primeira coluna - */}

        <div className="flex flex-col">
          <div className="flex gap-2 mr-auto sm:mr-0 md:mr-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-12 bg-linear-to-tr from-yellow-500 via-black/60 to-yellow-700 rounded-lg flex items-center justify-between shadow-xs shadow-black">
              <img
                src={PrismaHall}
                alt="PrismaHall Logo"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-br from-yellow-500 via-yellow-600 to-yellow-700 whitespace-nowrap ml-1 mr-5">
                Prisma Hall
              </h1>
              <p className="flex text-xs text-white font-semibold ml-2 mb-1">
                LIVE EXPERIENCE
              </p>
            </div>
          </div>

          <div className="flex flex-col mt-6 gap-y-1 text-white/60">
            <span>A melhor casa de shows da cidade.</span>

            <span>
              Experiências inesquecíveis com os melhores artistas e eventos.
            </span>
          </div>

          {/* - Redes sociais - */}

          <div className="flex gap-3">
            {/* - Wrapper Instagram - */}

            <div className="bg-[#1A1A1A] hover:bg-[#B8860B] p-3 text-white rounded-lg mt-4 cursor-pointer">
              <FaInstagram className="h-4 w-4" />
            </div>

            {/* - Wrapper Facebook - */}

            <div className="bg-[#1A1A1A] hover:bg-[#B8860B] p-3 text-white rounded-lg mt-4 cursor-pointer">
              <FaFacebook className="h-4 w-4" />
            </div>

            {/* - Wrapper Twitter - */}

            <div className="bg-[#1A1A1A] hover:bg-[#B8860B] p-3 text-white rounded-lg mt-4 cursor-pointer">
              <FaTwitter className="h-4 w-4" />
            </div>

            {/* - Wrapper Youtube - */}

            <div className="bg-[#1A1A1A] hover:bg-[#B8860B] p-3 text-white rounded-lg mt-4 cursor-pointer">
              <FaYoutube className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* - Segunda coluna - */}

        <div className="flex flex-col">
          <div className="flex gap-2 mr-auto sm:mr-0 md:mr-0">
            <div className="flex flex-col">
              <span className="text-white text-base font-bold">
                Links Rápidos
              </span>

              <div className="flex flex-col">
                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Próximos Eventos
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Agenda Completa
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Cardápio Bar
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Galeria de Fotos
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Comprar Ingressos
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
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
                  to="/"
                >
                  Central de Ajuda
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  FAQ - Perguntas Frequentes
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Política de Privacidade
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Termos de Uso
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
                >
                  Política de Reembolso
                </Link>

                <Link
                  className="text-sm text-white/60 hover:bg-clip-text hover:text-transparent hover:bg-linear-to-br hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:underline pt-3 cursor-pointer"
                  to="/"
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
              <span className="text-white text-base font-bold mb-3">
                Contato
              </span>

              <div className="flex flex-col gap-y-4">
                {/* - Localização - */}

                <div className="flex">
                  <IoLocationOutline className="h-5 w-5 mr-2 text-[#B8860B] shrink-0" />

                  <div className="flex flex-col text-sm text-white/60">
                    <span>Rua das Palmeiras, 247</span>
                    <span>Salvador - BA, 41720-180</span>
                  </div>
                </div>

                {/* - Telefone - */}

                <div className="flex">
                  <FiPhone className="h-5 w-5 mr-2 text-[#B8860B] shrink-0" />

                  <div className="flex flex-col text-sm text-white/60">
                    <span>(71) 99999-9999</span>
                  </div>
                </div>

                {/* - Email para contato - */}

                <div className="flex">
                  <GoMail className="h-5 w-5 mr-2 text-[#B8860B] shrink-0" />

                  <div className="flex flex-col text-sm text-white/60">
                    <span>contato@prismahallhouse.com</span>
                  </div>
                </div>

                {/* - Horários - */}

                <div className="flex flex-col bg-[#101010] w-full h-fit px-4 py-2 border border-[#B8860B] rounded-lg">
                  <span className="text-xs text-white/60 mb-1">
                    Horário de Funcionamento:
                  </span>

                  <span className="text-white font-semibold">
                    Qui - Sáb: 20h - 05h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* - Rodapé - */}

      <div className="flex flex-col sm:flex-row md:flex-row justify-center sm:justify-around md:justify-around items-center gap-2 sm:gap-0 w-full sm:w-[90%] md:w-[60%] border-t border-[#B8860B] text-sm text-white/60 py-4 text-center sm:text-left">
        <span>
          &copy; {year} <strong className="text-[#B8860B]">Prisma Hall</strong>{" "}
          Todos os direitos reservados.
        </span>

        <span>
          App desenvolvido por <strong>Daniel Lorenzo</strong> • {appVersion}
        </span>
      </div>
    </footer>
  );
};

export { Footer };
