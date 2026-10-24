const priceFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });

export function formatVenuePrice(price) {
  return Number.isFinite(price) ? `NOK ${priceFormat.format(price)} / night` : 'Price not specified';
}

export function venueMapLinks(location) {
  const { lat, lng } = location ?? {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 85
    || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) return null;
  const bbox = [Math.max(-180, lng - 0.015), Math.max(-85, lat - 0.008),
    Math.min(180, lng + 0.015), Math.min(85, lat + 0.008)].join(',');
  return {
    embed: `https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({ bbox, layer: 'mapnik', marker: `${lat},${lng}` })}`,
    full: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`,
  };
}
