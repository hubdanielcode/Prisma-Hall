"use client";

import { FaCocktail, FaTicketAlt, FaUserPlus, FaUsers } from "react-icons/fa";
import { formatCurrency } from "@/shared/utils/functions/formatters";
import { useMobileContext } from "@/shared/hooks/useMobileContext";
import { useNewVisitors } from "@/features/admin/analytics-management/hooks/useNewVisitors";
import { useTicketIncome } from "@/features/admin/analytics-management/hooks/useTicketIncome";
import { useVoucherIncome } from "@/features/admin/analytics-management/hooks/useVoucherIncome";
import { periodOptions, type PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import { tagFilterSchema } from "@/lib/validations";
import type { z } from "zod";

interface AnalyticsCardProps {
  selectedPeriod: PeriodLabelProps;
  selectedTag: z.infer<typeof tagFilterSchema>;
}

const AnalyticsCard = ({ selectedPeriod, selectedTag }: AnalyticsCardProps) => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();

  /* - Dados dos cards - */

  const { totalTicketIncome, isLoading: isTicketIncomeLoading } = useTicketIncome(selectedPeriod, "all_tags");
  const { totalVoucherIncome, isLoading: isVoucherIncomeLoading } = useVoucherIncome(selectedPeriod, "all_categories");
  const { totalNewUsers, totalBuyers, isLoading: isVisitorsLoading } = useNewVisitors(selectedPeriod, selectedTag);

  /* - Definições - */

  const selectedPeriodData = periodOptions.find((period) => period.id === selectedPeriod);
  const conversionRate = totalNewUsers === 0 ? "0% dos novos usuários" : `${Math.round((totalBuyers / totalNewUsers) * 100)}% dos novos usuários`;

  const cardData = [
    {
      id: "ticket_income",
      icon: <FaTicketAlt size={24} />,
      message: selectedPeriodData?.title ?? "",
      title: "Faturamento de ingressos",
      quantity: isTicketIncomeLoading ? "..." : formatCurrency(totalTicketIncome),
    },

    {
      id: "voucher_income",
      icon: <FaCocktail size={24} />,
      message: selectedPeriodData?.title ?? "",
      title: "Faturamento do bar",
      quantity: isVoucherIncomeLoading ? "..." : formatCurrency(totalVoucherIncome),
    },

    {
      id: "new_users",
      icon: <FaUserPlus size={24} />,
      message: selectedPeriodData?.title ?? "",
      title: "Novos usuários",
      quantity: isVisitorsLoading ? "..." : totalNewUsers,
    },

    {
      id: "buyers",
      icon: <FaUsers size={24} />,
      message: conversionRate,
      title: "Novos compradores",
      quantity: isVisitorsLoading ? "..." : totalBuyers,
    },
  ];

  return (
    <div className="flex justify-center">
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

              {/* - Valor - */}

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
    </div>
  );
};

export { AnalyticsCard };
