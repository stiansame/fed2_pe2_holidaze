export function validMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password && url.length <= 300;
  } catch {
    return false;
  }
}
