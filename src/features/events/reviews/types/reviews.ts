import type { LucideIcon } from "lucide-react";

export interface ReviewProps {
  review_id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comment?: string;
  verified: boolean;

  created_at: string;
}

export interface ReviewWithDetails extends ReviewProps {
  user_photo: string;
  user_name: string;
  event_name: string;
}

export interface ReviewBadges {
  label: string;
  value: string;
  icon: LucideIcon;
}
