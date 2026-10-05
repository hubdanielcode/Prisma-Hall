"use client";

import { createAttractionSchema, editAttractionSchema } from "@/lib/validations";
import { createContext } from "react";
import { useAttractions } from "@/features/events/event/hooks/useAttractions";
import type { AttractionProps } from "../types/attraction";
import type z from "zod";

interface AttractionContextType {
  /* - Dados das atrações - */

  attractions: AttractionProps[] | undefined;
  isLoading: boolean;
  error: Error | null;

  /* - Estados das atrações - */

  attractionBeingEdited: AttractionProps | null;
  setAttractionBeingEdited: (attractionBeingEdited: AttractionProps | null) => void;

  attractionBeingDeleted: AttractionProps | null;
  setAttractionBeingDeleted: (attractionBeingDeleted: AttractionProps | null) => void;

  /* - Mutations - */

  createAttractionMutation: (attraction: z.infer<typeof createAttractionSchema>) => Promise<unknown>;
  editAttractionMutation: (attraction: z.infer<typeof editAttractionSchema>) => Promise<unknown>;
  deleteAttractionMutation: (attractionId: string) => Promise<boolean | "attraction_in_use">;
}

const AttractionContext = createContext<AttractionContextType | null>(null);

const AttractionProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Dados das atrações - */

  const {
    attractions,
    isLoading,
    error,
    attractionBeingEdited,
    setAttractionBeingEdited,
    attractionBeingDeleted,
    setAttractionBeingDeleted,
    createAttractionMutation,
    editAttractionMutation,
    deleteAttractionMutation,
  } = useAttractions();

  return (
    <AttractionContext.Provider
      value={{
        /* - Dados das atrações - */

        attractions,
        isLoading,
        error,

        /* - Estados das atrações - */

        attractionBeingEdited,
        setAttractionBeingEdited,

        attractionBeingDeleted,
        setAttractionBeingDeleted,

        /* - Mutations - */

        createAttractionMutation,
        editAttractionMutation,
        deleteAttractionMutation,
      }}
    >
      {children}
    </AttractionContext.Provider>
  );
};

export { AttractionContext, AttractionProvider };
