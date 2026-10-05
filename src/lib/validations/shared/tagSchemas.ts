import { z } from "zod";

// 1. Tag Schema

const tagSchema = z.enum(["trap_and_hiphop", "forro", "samba_and_pagode", "metal", "eletronica", "funk", "rock", "pop"]);

// 2. Tag Filter Schema

const tagFilterSchema = z.enum([...tagSchema.options, "all_tags"]);

export { tagSchema, tagFilterSchema };
