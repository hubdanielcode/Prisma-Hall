import { fn } from "storybook/test";
import type { GalleryPictureProps } from "@/features/events/gallery/types/galleryPicture";

const fakePictures: GalleryPictureProps[] = [
  {
    id: "id-da-foto-fake-1",
    userId: "id-do-usuario-fake-1",
    eventId: "id-do-evento-1",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop",
    title: "Festival de Verão",
    tag: "eletronica",
    happenedAt: new Date("2026-08-01").toISOString(),
    likes: 120,
    likedByMe: true,

    createdAt: new Date("2026-08-01").toISOString(),
    updatedAt: new Date("2026-08-01").toISOString(),
  },

  {
    id: "id-da-foto-fake-2",
    userId: "id-do-usuario-fake-2",
    eventId: "id-do-evento-2",
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=600&fit=crop",
    title: "Noite Latina",
    tag: "funk",
    happenedAt: new Date("2026-08-02").toISOString(),
    likes: 157,
    likedByMe: false,

    createdAt: new Date("2026-08-02").toISOString(),
    updatedAt: new Date("2026-08-02").toISOString(),
  },

  {
    id: "id-da-foto-fake-3",
    userId: "id-do-usuario-fake-3",
    eventId: "id-do-evento-3",
    image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=600&fit=crop",
    title: "Highlights DJ Set",
    tag: "trap_and_hiphop",
    happenedAt: new Date("2026-08-03").toISOString(),
    likes: 194,
    likedByMe: false,

    createdAt: new Date("2026-08-03").toISOString(),
    updatedAt: new Date("2026-08-03").toISOString(),
  },

  {
    id: "id-da-foto-fake-4",
    userId: "id-do-usuario-fake-4",
    eventId: "id-do-evento-4",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    title: "Trap Night",
    tag: "forro",
    happenedAt: new Date("2026-08-04").toISOString(),
    likes: 231,
    likedByMe: true,

    createdAt: new Date("2026-08-04").toISOString(),
    updatedAt: new Date("2026-08-04").toISOString(),
  },

  {
    id: "id-da-foto-fake-5",
    userId: "id-do-usuario-fake-5",
    eventId: "id-do-evento-5",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=600&fit=crop",
    title: "Funk das Antigas",
    tag: "rock",
    happenedAt: new Date("2026-08-05").toISOString(),
    likes: 268,
    likedByMe: false,

    createdAt: new Date("2026-08-05").toISOString(),
    updatedAt: new Date("2026-08-05").toISOString(),
  },

  {
    id: "id-da-foto-fake-6",
    userId: "id-do-usuario-fake-6",
    eventId: "id-do-evento-6",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop",
    title: "Forró Universitário",
    tag: "samba_and_pagode",
    happenedAt: new Date("2026-08-06").toISOString(),
    likes: 305,
    likedByMe: false,

    createdAt: new Date("2026-08-06").toISOString(),
    updatedAt: new Date("2026-08-06").toISOString(),
  },

  {
    id: "id-da-foto-fake-7",
    userId: "id-do-usuario-fake-7",
    eventId: "id-do-evento-7",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop",
    title: "Rock Festival",
    tag: "metal",
    happenedAt: new Date("2026-08-07").toISOString(),
    likes: 342,
    likedByMe: true,

    createdAt: new Date("2026-08-07").toISOString(),
    updatedAt: new Date("2026-08-07").toISOString(),
  },
];

const useGallery = () => ({
  pictures: fakePictures,
  isLoading: false,
  error: null,
  likePictureMutation: fn(async (pictureId: string) => ({ pictureId, liked: true })),
});

export { useGallery, fakePictures };
