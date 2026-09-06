import { type ProductProps } from "@/features/bar";
import { type EventProps } from "@/features/events/event";

export type CartItem = CartProductProps | CartTicketProps;

export interface CartProductProps extends Omit<ProductProps, "description" | "createdAt"> {
  id: string;
  type: "drinks";
  product_id: string;
  quantity: number;
}

export interface CartTicketProps extends Omit<EventProps, "attendees" | "description" | "artist" | "createdAt"> {
  id: string;
  type: "tickets";
  ticket_id: string;
  quantity: number;
}
