const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

function buildQuery(lat, lng, radiusMeters) {
  return `
    [out:json][timeout:25];
    (
      node[amenity=pub](around:${radiusMeters},${lat},${lng});
      node[amenity=bar](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;
}

async function tryEndpoint(url, query) {
  const res = await fetch(url, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPubs(lat, lng, radiusMeters = 1000) {
  const query = buildQuery(lat, lng, radiusMeters);
  let lastError;

  for (const endpoint of ENDPOINTS) {
    try {
      const data = await tryEndpoint(endpoint, query);
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
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`All Overpass endpoints failed. Last error: ${lastError?.message}`);
}
