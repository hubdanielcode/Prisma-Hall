import { fn } from "storybook/test";
import { fakeEvents } from "./useEvents";
import { useState } from "react";

const useFavoriteEvents = () => {
  /* - Começa sem nenhum favorito para dar para testar o clique na story - */

  const [favoriteEventIds, setFavoriteEventIds] = useState<Set<string>>(new Set());

  const favoriteEvents = fakeEvents.filter((event) => favoriteEventIds.has(event.id));

  return {
    favoriteEvents,
    favoriteEventIds,
    isLoading: false,
    error: null,

    favoriteEventMutation: fn(async (eventId: string) => {
      const favorited = !favoriteEventIds.has(eventId);

      setFavoriteEventIds((current) => {
        const next = new Set(current);

        if (next.has(eventId)) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }

        return next;
      });

      return { eventId, favorited };
    }),
  };
};

export { useFavoriteEvents };
