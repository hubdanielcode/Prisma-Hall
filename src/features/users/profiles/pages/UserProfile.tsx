"use client";

import { ProfileHeader } from "@/shared/components/layout/ProfileHeader";
import { ProfileInformationsSection } from "../components/ProfileInformationsSection";
import { ProfileSettingsSection } from "../components/ProfileSettingsSection";
import { ProfileTicketsSection } from "../components/ProfileTicketsSection";
import { useState } from "react";

const UserProfile = () => {
  /* - Estado da aba ativa - */

  const [activeTab, setActiveTab] = useState<string>("tickets");

  return (
    <div className="bg-[#1A1A1A] text-white font-semibold min-h-screen max-w-full">
      <ProfileHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* - Área de ingressos - */}

      {activeTab === "tickets" && <ProfileTicketsSection />}

      {/* - Área de informações - */}

      {activeTab === "infos" && <ProfileInformationsSection />}

      {/* - Área de configurações - */}

      {activeTab === "settings" && <ProfileSettingsSection />}
    </div>
  );
};

export { UserProfile };
