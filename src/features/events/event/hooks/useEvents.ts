"use client";

import { createEvent as createEventAction, editEvent as editEventAction, deleteEvent as deleteEventAction, getAllEvents } from "@/actions";
import { EventProps } from "../types/event";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const useEvents = () => {
  const queryClient = useQueryClient();

  /* - Estados dos eventos - */

  const [eventBeingEdited, setEventBeingEdited] = useState<EventProps | null>(null);
  const [eventBeingDeleted, setEventBeingDeleted] = useState<EventProps | null>(null);

  /* - Query de leitura - */

  const { data: events, isLoading, error } = useQuery({ queryKey: ["events"], queryFn: getAllEvents });

  /* - Mutations - */

  // 1. CreateEventMutation

  const { mutateAsync: createEventMutation } = useMutation({
    mutationFn: createEventAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  // 2. EditEventMutation

  const { mutateAsync: editEventMutation } = useMutation({
    mutationFn: editEventAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  // 3. DeleteEventMutation

  const { mutateAsync: deleteEventMutation } = useMutation({
    mutationFn: deleteEventAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  return {
    /* - Leitura - */

    events,
    isLoading,
    error,

    /* - Mutations - */

    createEventMutation,
    editEventMutation,
    deleteEventMutation,

    /* - Estados dos eventos - */

    eventBeingEdited,
    setEventBeingEdited,
    eventBeingDeleted,
    setEventBeingDeleted,
  };
};

export { useEvents };
