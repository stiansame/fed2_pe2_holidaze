import { messages } from "../constants/messages.js";
import { validMediaUrl } from "./media.js";
import * as z from "zod/mini";

const imageSchema = z.object({
  url: z.string().check(
    z.refine(validMediaUrl, {
      error: ({ path }) => messages.invalidProfileImageUrl(path[0]),
    }),
  ),
  // Match HTML maxlength's UTF-16 units, including emoji.
  alt: z.string().check(
    z.refine((value) => value.length <= 120, {
      error: ({ path }) => messages.profileImageAltTooLong(path[0]),
    }),
  ),
});
const profileSchema = z.object({
  bio: z
    .string()
    .check(z.refine((value) => value.length <= 160, messages.bioTooLong)),
  avatar: z.optional(imageSchema),
  banner: z.optional(imageSchema),
});

/**
 * Builds validated profile changes while preserving blank or unchanged media fields.
 * @param {object} values Bio and avatar/banner URL and alt-text fields.
 * @param {object} profile Current profile used to detect unchanged media.
 * @returns {object}
 * @throws {import('zod/v4/core').$ZodError} All bio and changed-media validation issues.
 */
export function profileUpdate(values, profile) {
  const body = { bio: values.bio.trim() };
  for (const field of ["avatar", "banner"]) {
    const url = values[`${field}Url`].trim();
    const alt = values[`${field}Alt`].trim();
    // Omitted media stays unchanged. Do not revalidate an unchanged, possibly broken image.
    if (
      !url ||
      (url === profile[field]?.url && alt === (profile[field]?.alt ?? ""))
    )
      continue;
    body[field] = { url, alt };
  }
  return profileSchema.parse(body);
}
