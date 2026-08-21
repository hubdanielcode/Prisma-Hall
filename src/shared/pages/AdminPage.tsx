"use client";

import { useEffect, useState } from "react";
import { useMobileContext, AdminHeader } from "@/shared";
import { useBarContext } from "@/features/bar";
import { AnalyticsPage, BarManagementPage, EventsManagementPage } from "@/features/admin";

const AdminPage = () => {
  /* - Puxando do context - */

  const { isPortraitMobile, isLandscapeMobile } = useMobileContext();
  const { filteredProducts } = useBarContext();

  /* - Estados de paginação - */

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("bar");

  /* - Definições - */

  const itemsPerPage = 6;

  /* - Funções - */

  // 1. Garantindo que o número de páginas seja recalculado sempre que um item for adicionado ou deletado

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(filteredProducts.length / itemsPerPage), 1);

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredProducts.length]);

  console.log(activeTab);

  return (
    <>
      <AdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div
        className={`bg-[#1A1A1A] min-h-screen w-full ${
          isPortraitMobile
            ? "pt-24 pb-10"
            : isLandscapeMobile
              ? "pt-28 pb-12 px-6"
              : "pt-32 pb-14 px-8"
        }`}
      >
        {/* - Área gestão do bar - */}

        {activeTab === "bar" && (
          <div>
            <BarManagementPage />
          </div>
        )}

        {/* - Área de gestão dos eventos - */}

        {activeTab === "events" && (
          <div>
            <EventsManagementPage />
          </div>
        )}

        {/* - Área de gestão das estatísticas - */}

        {activeTab === "analytics" && (
          <div>
            <AnalyticsPage />
          </div>
        )}
      </div>
    </>
  );
};

export { AdminPage };
