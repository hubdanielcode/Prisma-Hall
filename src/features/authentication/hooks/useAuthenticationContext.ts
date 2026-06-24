import { AuthenticationContext } from "../context/AuthenticationContext";
import { useContext } from "react";

const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error(
      "useAuthenticationContext must be used within an AuthenticationProvider",
    );
  }
  return context;
};

export { useAuthenticationContext };
