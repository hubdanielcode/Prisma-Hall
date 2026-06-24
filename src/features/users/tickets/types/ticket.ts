export interface TicketProps {
  user_id: string;
  order_id: string;
  ticket_id: string;
  event_id: string;
  quantity: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Happened";
  events: Event;
  created_at: string;
}
