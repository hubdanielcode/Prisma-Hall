import { fn } from "storybook/test";
import type { AttractionProps } from "@/features/events/event/types/attraction";

const fakeAttractions: AttractionProps[] = [
  {
    id: "id-da-atracao-fake-1",
    name: "Atração Fake 01",
    description: "Descrição da primeira atração fake, serve apenas para o mock",
    image:
      "https://plus.unsplash.com/premium_photo-1669349127520-fa1e30b02055?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    createdAt: new Date("2026-08-01").toISOString(),
    updatedAt: new Date("2026-08-01").toISOString(),
  },

  {
    id: "id-da-atracao-fake-2",
    name: "Atração Fake 02",
    description: "Descrição da segunda atração fake, serve apenas para o mock",
    image:
      "https://plus.unsplash.com/premium_photo-1669349129088-002df7abca61?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    createdAt: new Date("2026-08-02").toISOString(),
    updatedAt: new Date("2026-08-02").toISOString(),
  },

  {
    id: "id-da-atracao-fake-3",
    name: "Atração Fake 03",
    description: null,
    image:
      "https://plus.unsplash.com/premium_photo-1669349127566-9be644ceac6e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8M3xlbnwwfHwwfHx8MA%3D%3D",

    createdAt: new Date("2026-08-03").toISOString(),
    updatedAt: new Date("2026-08-03").toISOString(),
  },
];

const fakeAttraction = fakeAttractions[0];

const useAttractions = () => ({
  attractions: fakeAttractions,
  isLoading: false,
  error: null,
  createAttractionMutation: fn(async () => fakeAttraction),
  editAttractionMutation: fn(async () => fakeAttraction),
  deleteAttractionMutation: fn(async () => true),
  attractionBeingEdited: null,
  setAttractionBeingEdited: fn(),
  attractionBeingDeleted: null,
  setAttractionBeingDeleted: fn(),
});

export { useAttractions, fakeAttractions, fakeAttraction };
