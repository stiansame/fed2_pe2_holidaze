export function venueCoordinates(lat, lng) {
  if (!String(lat ?? '').trim() || !String(lng ?? '').trim()) return null;
  const point = [Number(lat), Number(lng)];
  return point.every(Number.isFinite) && Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180 ? point : null;
}

export function venueFormData(form) {
  const text = name => String(form.get(name) ?? '').trim();
  const name = text('name');
  const description = text('description');
  const price = Number(text('price'));
  const maxGuests = Number(text('maxGuests'));
  if (!name || !description) throw new Error('Enter a venue name and description.');
  if (!text('price') || !Number.isFinite(price) || price < 0
    || !Number.isSafeInteger(Math.round(price * 100)) || price !== Math.round(price * 100) / 100) {
    throw new Error('Enter a price of zero or more, with at most two decimal places.');
  }
  if (!Number.isSafeInteger(maxGuests) || maxGuests < 1) throw new Error('Enter a whole guest count of at least one.');

  const descriptions = form.getAll('mediaAlt');
  const media = form.getAll('mediaUrl').map((value, index) => {
    const url = value.trim();
    const alt = String(descriptions[index] ?? '').trim();
    if (!url && !alt) return null;
    let parsed;
    try { parsed = new URL(url); } catch { /* Report a useful error below. */ }
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || url.length > 300) {
      throw new Error(`Image ${index + 1}: use a complete HTTP or HTTPS image URL of at most 300 characters.`);
    }
    if (alt.length > 120) throw new Error(`Image ${index + 1}: alt text must be 120 characters or fewer.`);
    return { url, alt };
  }).filter(Boolean);

  const location = {};
  for (const key of ['address', 'city', 'zip', 'country', 'continent']) {
    if (text(key)) location[key] = text(key);
  }
  const lat = text('lat');
  const lng = text('lng');
  if (lat || lng) {
    const point = venueCoordinates(lat, lng);
    if (!point) {
      throw new Error('Enter both coordinates: latitude from −90 to 90 and longitude from −180 to 180.');
    }
    [location.lat, location.lng] = point;
  }
  return {
    name, description, price, maxGuests, media,
    meta: Object.fromEntries(['wifi', 'parking', 'breakfast', 'pets'].map(key => [key, form.has(key)])),
    ...(Object.keys(location).length && { location }),
  };
}
