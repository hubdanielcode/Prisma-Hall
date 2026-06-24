import { Footer } from "@/shared";
import { useState } from "react";
import { ProfilePageHeader } from "../components/ProfilePageHeader";
import { ProfileTicketsSection } from "../components/ProfileTicketsSection";
import { ProfileInformationsSection } from "../components/ProfileInformationsSection";
import { ProfileSettingsSection } from "../components/ProfileSettingsSection";

const ProfilePage = () => {
  /* - Estado da aba ativa - */

  const [activeTab, setActiveTab] = useState<string>("tickets");

  return (
    <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
      <ProfilePageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* - Área de ingressos - */}

      {activeTab === "tickets" && <ProfileTicketsSection />}

      {/* - Área de informações - */}

      {activeTab === "infos" && <ProfileInformationsSection />}

      {/* - Área de configurações - */}

      {activeTab === "settings" && <ProfileSettingsSection />}

      <Footer />
    </div>
  );
};

export { ProfilePage };
