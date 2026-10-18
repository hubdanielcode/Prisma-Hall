"use client";

import { CancelEventResult, DeleteEventResult, EventProps } from "../types/event";
import { createContext, useState } from "react";
import { createEventSchema, editEventSchema } from "@/lib/validations";
import { eventTags } from "../utils/eventTags";
import { TagProps } from "../types/tag";
import { useEvents } from "@/features/events/event/hooks/useEvents";
import z from "zod";

interface EventContextType {
  filteredEvents: EventProps[];
  tags: TagProps[];
  isLoading: boolean;
  error: Error | null;

  /* - Estados dos eventos - */

  eventBeingCancelled: EventProps | null;
  setEventBeingCancelled: (eventBeingCancelled: EventProps | null) => void;

  eventBeingEdited: EventProps | null;
  setEventBeingEdited: (eventBeingEdited: EventProps | null) => void;

  eventBeingDeleted: EventProps | null;
  setEventBeingDeleted: (eventBeingDeleted: EventProps | null) => void;

  selectedTag: string;
  setSelectedTag: (selectedTag: string) => void;

  selectedStatus: "all_status" | "happened" | "soon" | "cancelled";
  setSelectedStatus: (selectedStatus: "all_status" | "happened" | "soon" | "cancelled") => void;

  /* - Query de leitura - */

  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;

  /* - Mutations - */

  cancelEventMutation: (eventId: string) => Promise<CancelEventResult>;
  createEventMutation: (event: z.infer<typeof createEventSchema>) => Promise<unknown>;
  editEventMutation: (event: z.infer<typeof editEventSchema>) => Promise<unknown>;
  deleteEventMutation: (eventId: string) => Promise<DeleteEventResult>;
}

const EventContext = createContext<EventContextType | null>(null);

const EventProvider = ({ children }: { children: React.ReactNode }) => {
  /* - Dados dos eventos - */

  const {
    events,
    isLoading,
    error,

    eventBeingCancelled,
    setEventBeingCancelled,

    eventBeingEdited,
    setEventBeingEdited,

    eventBeingDeleted,
    setEventBeingDeleted,

    cancelEventMutation,
    createEventMutation,
    editEventMutation,
    deleteEventMutation,
  } = useEvents();

  /* - Estados de busca - */

  const [searchQuery, setSearchQuery] = useState("");

  /* - Estados dos eventos - */

  const [selectedTag, setSelectedTag] = useState("all_tags");
  const [selectedStatus, setSelectedStatus] = useState<"all_status" | "happened" | "soon" | "cancelled">("soon");

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

        eventBeingCancelled,
        setEventBeingCancelled,

        eventBeingEdited,
        setEventBeingEdited,

        eventBeingDeleted,
        setEventBeingDeleted,

        selectedTag,
        setSelectedTag,

        selectedStatus,
        setSelectedStatus,

        /* - Mutations - */

        cancelEventMutation,
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
