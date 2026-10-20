import { EventStatus, EventTag } from "@/prisma/generated/prisma/enums";

export interface EventProps {
  id: string;
  title: string;
  description: string;
  tag: EventTag;
  attractionId: string;
  attractionName: string;
  image: string;
  status: EventStatus;
  price: number;
  startsAt: string;
  attendees: number;
  rating: number;

  createdAt: string;
  updatedAt: string;
}

export type DeleteEventResult =
  | { success: true }
  | {
      success: false;
      reason: "unauthorized" | "not-found" | "has-dependencies" | "unknown";
    };

/* - false: não cancelou. Objeto: evento cancelado; pendingRefunds é quantos pedidos ainda estão sem reembolso (-1 se o processamento falhou por inteiro) - */

export type CancelEventResult = false | { pendingRefunds: number };
