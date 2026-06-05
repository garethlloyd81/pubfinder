const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocode(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: 1,
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'Accept-Language': 'en' },
  });

  if (!res.ok) throw new Error('Geocoding request failed');

  const data = await res.json();
  if (!data.length) throw new Error(`Location not found: "${query}"`);

  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}
