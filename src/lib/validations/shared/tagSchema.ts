import { z } from "zod";

const tagSchema = z.enum(["trap_and_hiphop", "forro", "samba_and_pagode", "metal", "eletronica", "funk", "rock", "pop", "all_tags"]);

export { tagSchema };
