const BASE_URL = 'https://api.geoapify.com/v2/places';
const KEY = import.meta.env.VITE_GEOAPIFY_KEY;

function isPositive(val) {
  return !!val && val !== 'no';
}

export async function fetchPubs(lat, lng, radiusMeters = 500) {
  const params = new URLSearchParams({
    categories: 'catering.pub,catering.bar',
    filter: `circle:${lng},${lat},${radiusMeters}`,
    limit: 50,
    apiKey: KEY,
  });

  const res = await fetch(`${BASE_URL}?${params}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`Geoapify error: ${res.status}`);

  const data = await res.json();

  return data.features.map((f) => {
    const p = f.properties;
    const raw = p.datasource?.raw ?? {};
    return {
      id: p.place_id,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      name: p.name ?? 'Unnamed pub',
      address: [p.housenumber, p.street].filter(Boolean).join(' ') || null,
      phone: p.phone ?? null,
      website: p.website ?? null,
      opening_hours: p.opening_hours ?? null,
      features: {
        outdoor_seating: isPositive(raw.outdoor_seating),
        real_ale: isPositive(raw.real_ale),
        wheelchair: isPositive(raw.wheelchair),
        air_conditioning: isPositive(raw.air_conditioning),
      },
    };
  });
}
