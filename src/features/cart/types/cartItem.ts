import { type ProductProps } from "@/features/bar";
import { type EventProps } from "@/features/events/event";

export type CartItem = CartProductProps | CartTicketProps;

export interface CartProductProps extends Omit<
  ProductProps,
  "description" | "created_at"
> {
  id: string;
  type: "drinks";
  quantity: number;
}

export interface CartTicketProps extends Omit<
  EventProps,
  "attendees" | "description" | "artist" | "created_at"
> {
  id: string;
  type: "tickets";
  ticket_id: string;
  quantity: number;
}
