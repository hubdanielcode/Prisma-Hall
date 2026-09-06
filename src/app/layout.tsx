import "./globals.css";
import { AuthenticationProvider } from "@/features/authentication";
import { BarProvider } from "@/features/bar";
import { CalendarProvider } from "@/features/events";
import { CartProvider } from "@/features/cart";
import { MobileProvider, ThemeProvider } from "@/shared";
import { ProfileProvider } from "@/features/users";
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
