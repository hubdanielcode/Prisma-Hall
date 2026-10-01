import { fn } from "storybook/test";
import type { EventProps } from "@/features/events/event/types/event";

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const fakeEvents: EventProps[] = [
  {
    id: "id-do-evento-1",
    title: "Evento Fake 01",
    description: "Descrição do primeiro evento fake, serve apenas para o mock",
    tag: "eletronica",
    attractionName: "Nome da atração do evento 01",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "happened",
    price: 50,
    startsAt: daysFromNow(-30),
    attendees: 160,
    rating: 5.0,

    createdAt: new Date("2026-08-01").toISOString(),
    updatedAt: new Date("2026-08-01").toISOString(),
  },

  {
    id: "id-do-evento-2",
    title: "Evento Fake 02",
    description: "Descrição do segundo evento fake, serve apenas para o mock",
    tag: "eletronica",
    attractionName: "Nome da atração do evento 02",
    image:
      "https://plus.unsplash.com/premium_photo-1669349129088-002df7abca61?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "happened",
    price: 50,
    startsAt: daysFromNow(-20),
    attendees: 120,
    rating: 4.0,

    createdAt: new Date("2026-08-02").toISOString(),
    updatedAt: new Date("2026-08-02").toISOString(),
  },

  {
    id: "id-do-evento-3",
    title: "Evento Fake 03",
    description: "Descrição do terceiro evento fake, serve apenas para o mock",
    tag: "metal",
    attractionName: "Nome da atração do evento 03",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127566-9be644ceac6e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8M3xlbnwwfHwwfHx8MA%3D%3D",
    status: "happened",
    price: 50,
    startsAt: daysFromNow(-10),
    attendees: 200,
    rating: 3.0,

    createdAt: new Date("2026-08-03").toISOString(),
    updatedAt: new Date("2026-08-03").toISOString(),
  },

  {
    id: "id-do-evento-4",
    title: "Evento Fake 04",
    description: "Descrição do quarto evento fake, serve apenas para o mock",
    tag: "metal",
    attractionName: "Nome da atração do evento 04",
    image:
      "https://images.unsplash.com/photo-1790468354600-68bed467d84c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "happened",
    price: 50,

    startsAt: daysFromNow(-5),
    attendees: 80,
    rating: 0,

    createdAt: new Date("2026-08-04").toISOString(),
    updatedAt: new Date("2026-08-04").toISOString(),
  },

  {
    id: "id-do-evento-5",
    title: "Evento Fake 05",
    description: "Descrição do quinto evento fake, serve apenas para o mock",
    tag: "forro",
    attractionName: "Nome da atração do evento 05",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127530-23d9e3dab307?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(1),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-05").toISOString(),
    updatedAt: new Date("2026-08-05").toISOString(),
  },

  {
    id: "id-do-evento-6",
    title: "Evento Fake 06",
    description: "Descrição do sexto evento fake, serve apenas para o mock",
    tag: "forro",
    attractionName: "Nome da atração do evento 06",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127561-6e8ae10b8642?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(3),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-06").toISOString(),
    updatedAt: new Date("2026-08-06").toISOString(),
  },

  {
    id: "id-do-evento-7",
    title: "Evento Fake 07",
    description: "Descrição do sétimo evento fake, serve apenas para o mock",
    tag: "samba_and_pagode",
    attractionName: "Nome da atração do evento 07",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127571-ebf4a6cbdf69?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(6),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-07").toISOString(),
    updatedAt: new Date("2026-08-07").toISOString(),
  },

  {
    id: "id-do-evento-8",
    title: "Evento Fake 08",
    description: "Descrição do oitavo evento fake, serve apenas para o mock",
    tag: "samba_and_pagode",
    attractionName: "Nome da atração do evento 08",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127580-968bafc64324?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(15),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-08").toISOString(),
    updatedAt: new Date("2026-08-08").toISOString(),
  },

  {
    id: "id-do-evento-9",
    title: "Evento Fake 09",
    description: "Descrição do nono evento fake, serve apenas para o mock",
    tag: "trap_and_hiphop",
    attractionName: "Nome da atração do evento 09",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(20),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-09").toISOString(),
    updatedAt: new Date("2026-08-09").toISOString(),
  },

  {
    id: "id-do-evento-10",
    title: "Evento Fake 10",
    description: "Descrição do décimmo evento fake, serve apenas para o mock",
    tag: "trap_and_hiphop",
    attractionName: "Nome da atração do evento 10",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(30),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-10").toISOString(),
    updatedAt: new Date("2026-08-10").toISOString(),
  },

  {
    id: "id-do-evento-11",
    title: "Evento Fake 11",
    description: "Descrição do décimo primeiro evento fake, serve apenas para o mock",
    tag: "rock",
    attractionName: "Nome da atração do evento 11",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(45),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-11").toISOString(),
    updatedAt: new Date("2026-08-11").toISOString(),
  },

  {
    id: "id-do-evento-12",
    title: "Evento Fake 12",
    description: "Descrição do décimo segundo evento fake, serve apenas para o mock",
    tag: "funk",
    attractionName: "Nome da atração do evento 12",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "soon",
    price: 50,
    startsAt: daysFromNow(60),
    attendees: 0,
    rating: 0,

    createdAt: new Date("2026-08-12").toISOString(),
    updatedAt: new Date("2026-08-12").toISOString(),
  },
];

const fakeEvent = fakeEvents[0];

const useEvents = () => ({
  events: fakeEvents,
  isLoading: false,
  error: null,
  createEventMutation: fn(),
  editEventMutation: fn(),
  deleteEventMutation: fn(),
  eventBeingEdited: null,
  setEventBeingEdited: fn(),
  eventBeingDeleted: null,
  setEventBeingDeleted: fn(),
});

export { useEvents, fakeEvent, fakeEvents };
