import { fn } from "storybook/test";
import { fakeEvents } from "./useEvents";
import { useState } from "react";

const fakeFavoriteEvents = [fakeEvents[0], fakeEvents[1]];

const useFavoriteEvents = () => {
  /* - Começa sem nenhum favorito para dar para testar o clique na story - */

  const [favoriteEventIds, setFavoriteEventIds] = useState<Set<string>>(new Set());

  const favoriteEvents = fakeEvents.filter((event) => favoriteEventIds.has(event.id));

  return {
    favoriteEvents,
    favoriteEventIds,
    isLoading: false,
    error: null,
    isPending: false,

    favoriteEventMutation: fn(async (eventId: string) => {
      const favorited = !favoriteEventIds.has(eventId);

      setFavoriteEventIds((currentFavoriteEventIds) => {
        const updatedFavoriteEventIds = new Set(currentFavoriteEventIds);

        if (updatedFavoriteEventIds.has(eventId)) {
          updatedFavoriteEventIds.delete(eventId);
        } else {
          updatedFavoriteEventIds.add(eventId);
        }

        return updatedFavoriteEventIds;
      });

      return { eventId, favorited };
    }),
  };
};

export { useFavoriteEvents, fakeFavoriteEvents };
