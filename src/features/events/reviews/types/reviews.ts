import type { LucideIcon } from "lucide-react";

export interface ReviewProps {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithDetails extends ReviewProps {
  userPhoto: string | null;
  userName: string;
  eventName: string;
  verifiedBadge: boolean;
}

export interface ReviewBadges {
  label: string;
  value: string;
  icon: LucideIcon;
}
