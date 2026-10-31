export function profileUpdate(values, profile) {
  const body = { bio: values.bio.trim() };
  if (body.bio.length > 160) throw new Error('Bio must be 160 characters or fewer.');
  for (const field of ['avatar', 'banner']) {
    const url = values[`${field}Url`].trim();
    const alt = values[`${field}Alt`].trim();
    // Omitted media stays unchanged. Do not revalidate an unchanged, possibly broken image.
    if (!url || (url === profile[field]?.url && alt === (profile[field]?.alt ?? ''))) continue;
    let parsed;
    try { parsed = new URL(url); } catch { /* Report the same useful message for all invalid URLs. */ }
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || url.length > 300) {
      throw new Error(`Use a complete HTTP or HTTPS URL of at most 300 characters for ${field}.`);
    }
    if (alt.length > 120) throw new Error(`${field === 'avatar' ? 'Avatar' : 'Banner'} description must be 120 characters or fewer.`);
    body[field] = { url, alt };
  }
  return body;
}
