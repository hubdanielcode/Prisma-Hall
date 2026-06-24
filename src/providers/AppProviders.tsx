import { BrowserRouter as Router } from "react-router-dom";
import { AuthenticationProvider } from "@/features/authentication";
import { ProfileProvider } from "@/features/users";
import { ThemeProvider, MobileProvider } from "@/shared";
import { CalendarProvider } from "@/features/events";
import { BarProvider } from "@/features/bar";
import { CartProvider } from "@/features/cart";
import type React from "react";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Router>
      <AuthenticationProvider>
        <ProfileProvider>
          <ThemeProvider>
            <CalendarProvider>
              <BarProvider>
                <CartProvider>
                  <MobileProvider>{children}</MobileProvider>
                </CartProvider>
              </BarProvider>
            </CalendarProvider>
          </ThemeProvider>
        </ProfileProvider>
      </AuthenticationProvider>
    </Router>
  );
};

export { AppProviders };
