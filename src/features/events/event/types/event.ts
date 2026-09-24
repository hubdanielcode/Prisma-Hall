export interface EventProps {
  id: string;
  title: string;
  description: string;
  tag: "all_tags" | "trap_and_hiphop" | "forro" | "samba_and_pagode" | "metal" | "eletronica" | "funk" | "rock" | "pop";
  attractionId: string;
  image: string;
  status: "happened" | "soon";
  price: number;
  startsAt: string;
  attendees: number;
  rating: number;

  createdAt: string;
  updatedAt: string;
}
