import { messages } from "../constants/messages.js";

export function profileUpdate(values, profile) {
  const body = { bio: values.bio.trim() };
  if (body.bio.length > 160) throw new Error(messages.bioTooLong);
  for (const field of ["avatar", "banner"]) {
    const url = values[`${field}Url`].trim();
    const alt = values[`${field}Alt`].trim();
    // Omitted media stays unchanged. Do not revalidate an unchanged, possibly broken image.
    if (
      !url ||
      (url === profile[field]?.url && alt === (profile[field]?.alt ?? ""))
    )
      continue;
    if (!validMediaUrl(url)) {
      throw new Error(messages.invalidProfileImageUrl(field));
    }
    if (alt.length > 120)
      throw new Error(messages.profileImageAltTooLong(field));
    body[field] = { url, alt };
  }
  return body;
}
import { validMediaUrl } from "./media.js";
