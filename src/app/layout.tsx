import { AuthenticationProvider } from "@/features/authentication/context/AuthenticationContext";
import { BarProvider } from "@/features/bar/context/BarContext";
import { CalendarProvider } from "@/features/events/agenda/context/CalendarContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import { MobileProvider, ThemeProvider } from "@/shared/context";
import { ProfileProvider } from "@/features/users/profiles/context/ProfileContext";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prisma Hall",
  icons: {
    icon: "/logo/ph-icon.png",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthenticationProvider>
            <ProfileProvider>
              <ThemeProvider>
                <CalendarProvider>
                  <BarProvider>
                    <CartProvider>
                      <MobileProvider>
                        <div id="root">{children}</div>
                      </MobileProvider>
                    </CartProvider>
                  </BarProvider>
                </CalendarProvider>
              </ThemeProvider>
            </ProfileProvider>
          </AuthenticationProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
