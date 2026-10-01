"use client";

import z from "zod";
import { EventProps } from "../types/event";
import { TagProps } from "../types/tag";
import { createEventSchema, editEventSchema } from "@/lib/validations";
import { createContext, useState } from "react";
import { useEvents } from "../hooks/useEvents";
import { eventTags } from "../utils/eventTags";

interface EventContextType {
  filteredEvents: EventProps[];
  tags: TagProps[];
  isLoading: boolean;
  error: Error | null;

  /* - Estados dos eventos - */

  eventBeingEdited: EventProps | null;
  setEventBeingEdited: (eventBeingEdited: EventProps | null) => void;

  eventBeingDeleted: EventProps | null;
  setEventBeingDeleted: (eventBeingDeleted: EventProps | null) => void;

  selectedTag: string;
  setSelectedTag: (selectedTag: string) => void;

  selectedStatus: "all_status" | "happened" | "soon";
  setSelectedStatus: (selectedStatus: "all_status" | "happened" | "soon") => void;

  /* - Query de leitura - */

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;

  /* - Mutations - */

  createEventMutation: (event: z.infer<typeof createEventSchema>) => Promise<unknown>;
  editEventMutation: (event: z.infer<typeof editEventSchema>) => Promise<unknown>;
  deleteEventMutation: (eventId: string) => Promise<unknown>;
}

const EventContext = createContext<EventContextType | null>(null);

const EventProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Dados dos eventos - */

  const {
    events,
    isLoading,
    error,
    eventBeingEdited,
    setEventBeingEdited,
    eventBeingDeleted,
    setEventBeingDeleted,
    createEventMutation,
    editEventMutation,
    deleteEventMutation,
  } = useEvents();

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState("");

  /* - Estados dos eventos - */

  const [selectedTag, setSelectedTag] = useState("all_tags");
  const [selectedStatus, setSelectedStatus] = useState<"all_status" | "happened" | "soon">("soon");

  /* - Definições - */

  const possibleTags = [{ id: "all_tags", title: "Todas as Tags" }, ...eventTags] as const;

  const tags: TagProps[] = possibleTags.map((tag) => ({
    id: tag.id,
    title: tag.title,
  }));

  const filteredEvents =
    events?.filter((event) => {
      const matchingNames = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchingTags = selectedTag === "all_tags" || event.tag === selectedTag;
      const matchingStatus = selectedStatus === "all_status" || event.status === selectedStatus;

      return matchingNames && matchingTags && matchingStatus;
    }) ?? [];

  return (
    <EventContext.Provider
      value={{
        /* - Dados dos produtos - */

        filteredEvents,
        tags,
        isLoading,
        error,

        /* - Estados de busca - */

        searchQuery,
        setSearchQuery,

        /* - Estados dos produtos - */

        eventBeingEdited,
        setEventBeingEdited,

        eventBeingDeleted,
        setEventBeingDeleted,

        selectedTag,
        setSelectedTag,

        selectedStatus,
        setSelectedStatus,

        /* - Mutations - */

        createEventMutation,
        editEventMutation,
        deleteEventMutation,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export { EventContext, EventProvider };
