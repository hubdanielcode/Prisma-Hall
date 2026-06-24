import { useState, useEffect } from "react";
import { type EventProps } from "../../event/types/event";
import { getEvents } from "../../event/services/eventsServices";

const useEvents = () => {
  /* - Estados de eventos - */

  const [events, setEvents] = useState<EventProps[]>([]);

  /* - Estados de carregamento - */

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* - Estados de erro - */

  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        setError("Erro ao buscar eventos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, isLoading, error };
};

export { useEvents };
