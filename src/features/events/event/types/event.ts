export interface EventProps {
  event_id: string;
  event_name: string;
  title: string;
  description: string;
  artist: string;
  starts_at: string;
  price: number;
  attendees: number;
  rating: number;
  image: string;
  tag: string;
  status: "Active" | "Pending" | "Cancelled" | "Happened";

  created_at: string;
}
