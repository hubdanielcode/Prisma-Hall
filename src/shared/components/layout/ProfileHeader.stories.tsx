import { useState } from "react";
import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import { ProfileProvider } from "@/features/users/profiles/context/ProfileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { MobileProvider } from "../../context/MobileContext";
import { ProfileHeader } from "./ProfileHeader";

export default {
  title: "Layouts/Protected/Profile",
  component: ProfileHeader,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState<string>("tickets");

  return (
    <QueryProvider>
      <AuthenticationProvider>
        <CartProvider>
          <MobileProvider>
            <ProfileProvider>
              <ProfileHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </ProfileProvider>
          </MobileProvider>
        </CartProvider>
      </AuthenticationProvider>
    </QueryProvider>
  );
};

export { Profile as "Profile Header" };
