import { EventTag } from "@/prisma/generated/prisma/enums";

export interface GalleryPictureProps {
  id: string;
  userId: string;
  eventId: string;
  image: string;
  title: string;
  tag: EventTag;
  happenedAt: string;
  likes: number;
  likedByMe: boolean;

  createdAt: string;
  updatedAt: string;
}
