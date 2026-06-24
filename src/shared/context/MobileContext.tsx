import { createContext, useEffect, useState, type ReactNode } from "react";

export interface MobileContextType {
  /* - Estados de tamanho - */

  isPortraitMobile: boolean;
  setIsPortraitMobile: (isPortraitMobile: boolean) => void;
  isLandscapeMobile: boolean;
  setIsLandscapeMobile: (isLandscapeMobile: boolean) => void;
}

const MobileContext = createContext<MobileContextType | null>(null);

const MobileProvider = ({ children }: { children: ReactNode }) => {
  /* - Estados de tamanho - */

  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(false);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState<boolean>(false);

  /* - Funções - */

  // 1. Definindo o layout baseado no tamanho da tela

  const getScreenSize = () => {
    const isPortraitMobile = window.matchMedia("(max-width: 639px)").matches;
    const isLandscapeMobile = window.matchMedia(
      "(min-width: 640px) and (max-width: 1023px) and (orientation: landscape)",
    ).matches;

    return { isPortraitMobile, isLandscapeMobile };
  };

  // 2. Redefinindo a tela para o layout escolhido

  useEffect(() => {
    const handleResizeScreen = () => {
      const { isPortraitMobile, isLandscapeMobile } = getScreenSize();
      setIsLandscapeMobile(isLandscapeMobile);
      setIsPortraitMobile(isPortraitMobile);
    };
    handleResizeScreen();

    window.addEventListener("resize", handleResizeScreen);

    return () => {
      window.removeEventListener("resize", handleResizeScreen);
    };
  }, []);

  return (
    <MobileContext.Provider
      value={{
        isPortraitMobile,
        setIsPortraitMobile,
        isLandscapeMobile,
        setIsLandscapeMobile,
      }}
    >
      {children}
    </MobileContext.Provider>
  );
};

export { MobileContext, MobileProvider };
