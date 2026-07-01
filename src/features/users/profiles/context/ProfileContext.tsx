import { createContext, useState, type ReactNode } from "react";

export interface ProfileContextType {
  /* - Dados do comprador - */

  CPF: string;
  setCPF: (CPF: string) => void;
  birthDate: string;
  setBirthDate: (birthDate: string) => void;
  city: string;
  setCity: (city: string) => void;
  UF: string;
  setUF: (UF: string) => void;
  neighborhood: string;
  setNeighborhood: (neighborhood: string) => void;
  street: string;
  setStreet: (street: string) => void;
  number: string;
  setNumber: (number: string) => void;
  complement: string;
  setComplement: (complement: string) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const ProfileProvider = ({ children }: { children: ReactNode }) => {
  /* - Estados do comprador - */

  const [CPF, setCPF] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [UF, setUF] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [complement, setComplement] = useState<string>("");

  return (
    <ProfileContext.Provider
      value={{
        CPF,
        setCPF,
        birthDate,
        setBirthDate,
        city,
        setCity,
        UF,
        setUF,
        neighborhood,
        setNeighborhood,
        street,
        setStreet,
        number,
        setNumber,
        complement,
        setComplement,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export { ProfileContext, ProfileProvider };
