const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function fetchPubs(lat, lng, radiusMeters = 1000) {
  const query = `
    [out:json][timeout:25];
    (
      node[amenity=pub](around:${radiusMeters},${lat},${lng});
      node[amenity=bar](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) throw new Error('Overpass API request failed');

  const data = await res.json();

  return data.elements.map((el) => ({
    id: el.id,
    lat: el.lat,
    lng: el.lon,
    name: el.tags?.name ?? 'Unnamed pub',
    address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street']].filter(Boolean).join(' ') || null,
    phone: el.tags?.phone ?? null,
    website: el.tags?.website ?? null,
    opening_hours: el.tags?.opening_hours ?? null,
  }));
}
