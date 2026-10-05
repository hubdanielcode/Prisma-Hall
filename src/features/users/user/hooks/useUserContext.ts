import { UserContext } from "../context/UserContext";
import { useContext } from "react";

const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export { useUserContext };
