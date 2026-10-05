"use client";

import { FaCheckCircle, FaUserClock, FaUserShield, FaUsers } from "react-icons/fa";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useUsers } from "@/features/users/user/hooks/useUsers";

const UsersManagementCard = () => {
  /* - Puxando do context - */

  const { users } = useUsers();
  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Definições - */

  const userList = users ?? [];
  const totalUsers = userList.length;
  const totalAdmins = userList.filter((user) => user.role === "admin").length;
  const totalVerified = userList.filter((user) => user.verifiedBadge).length;
  const totalNotValidated = userList.filter((user) => user.validatedAt === null).length;

  const percentageOfTotal = (quantity: number) => (totalUsers === 0 ? "0% do total" : `${Math.round((quantity / totalUsers) * 100)}% do total`);

  const cardData = [
    {
      id: "all",
      icon: <FaUsers size={24} />,
      message: "Cadastrados",
      title: "Total de usuários",
      quantity: totalUsers,
    },

    {
      id: "admins",
      icon: <FaUserShield size={24} />,
      message: percentageOfTotal(totalAdmins),
      title: "Administradores",
      quantity: totalAdmins,
    },

    {
      id: "verified",
      icon: <FaCheckCircle size={24} />,
      message: percentageOfTotal(totalVerified),
      title: "Usuários verificados",
      quantity: totalVerified,
    },

    {
      id: "not_validated",
      icon: <FaUserClock size={24} />,
      message: totalNotValidated > 0 ? "Requer atenção" : "Tudo em dia",
      title: "Aguardando validação",
      quantity: totalNotValidated,
    },
  ];

  return (
    <div
      className={`w-full ${isPortraitMobile ? "grid grid-cols-2 gap-2" : "flex flex-nowrap items-stretch"} ${isLandscapeMobile ? "gap-3" : "gap-4"}`}
    >
      {cardData.map((card) => (
        <div
          className={`bg-black border border-[#B8860B] rounded-lg w-auto ${
            isPortraitMobile ? "col-span-1 h-32 p-1" : isLandscapeMobile ? "flex-1 h-32 p-0.75" : "flex-1 h-36 p-2"
          }`}
          key={card.id}
        >
          <div className="flex flex-col justify-center w-full">
            {/* - Ícone, mensagem e título - */}

            <div className={`flex flex-col text-[#B8860B] ${isPortraitMobile ? "gap-1" : "gap-1.5"}`}>
              <div className="flex justify-between w-full">
                <span className="w-fit border border-[#B8860B] rounded-lg bg-[#3D2B0A] p-1.5 m-2">{card.icon}</span>

                <span className="text-green-400 text-xs font-semibold text-nowrap tracking-widest uppercase mt-4 ml-auto pr-2">{card.message}</span>
              </div>

              <span
                className={`text-white/60 font-semibold text-nowrap tracking-widest uppercase pt-1 pl-2 ${
                  isPortraitMobile ? "text-[11px]" : isLandscapeMobile ? "text-[9px]" : "text-[11px]"
                }`}
              >
                {card.title}
              </span>
            </div>

            {/* - Quantidade - */}

            <span
              className={`flex items-start justify-start text-white font-bold pt-1 pl-2 ${
                isPortraitMobile ? "text-xl" : isLandscapeMobile ? "text-lg" : "text-2xl"
              }`}
            >
              {card.quantity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export { UsersManagementCard };
