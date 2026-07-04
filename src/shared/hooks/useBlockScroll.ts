import { useEffect } from "react";

const useBlockScroll = (isOpen: boolean) => {
  /* - Bloqueando o scroll no momento do render do modal - */

  useEffect(() => {
    if (isOpen) {
      const currentViewport = scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${currentViewport}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      /* - Cleanup - */

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        scrollTo(0, currentViewport);
      };
    }
  }, [isOpen]);
};

export { useBlockScroll };
