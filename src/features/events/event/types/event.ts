import { EventStatus, EventTag } from "@/prisma/generated/prisma/enums";

export interface EventProps {
  id: string;
  title: string;
  description: string;
  tag: EventTag;
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
