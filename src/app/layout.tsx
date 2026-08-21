import { AuthenticationProvider } from "@/features/authentication";
import { ProfileProvider } from "@/features/users";
import { MobileProvider, ThemeProvider } from "@/shared";
import { CalendarProvider } from "@/features/events";
import { BarProvider, ProductsProvider } from "@/features/bar";
import { CartProvider } from "@/features/cart";
import "./globals.css";
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
        <AuthenticationProvider>
          <ProfileProvider>
            <ThemeProvider>
              <CalendarProvider>
                <ProductsProvider>
                  <BarProvider>
                    <CartProvider>
                      <MobileProvider>
                        <div id="root">{children}</div>
                      </MobileProvider>
                    </CartProvider>
                  </BarProvider>
                </ProductsProvider>
              </CalendarProvider>
            </ThemeProvider>
          </ProfileProvider>
        </AuthenticationProvider>
      </body>
    </html>
  );
};

export default RootLayout;
