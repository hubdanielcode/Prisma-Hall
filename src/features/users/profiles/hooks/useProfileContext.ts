import { ProfileContext } from "../context/ProfileContext";
import { useContext } from "react";

const useProfileContext = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }

  return context;
};

export { useProfileContext };
