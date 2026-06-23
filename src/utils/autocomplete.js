const PHOTON_URL = 'https://photon.komoot.io/api/';

export async function getSuggestions(query) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    countrycode: 'gb',
    limit: 5,
    lang: 'en',
  });

  const res = await fetch(`${PHOTON_URL}?${params}`, {
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return [];

  const data = await res.json();

  return data.features.map((f) => {
    const p = f.properties;
    const parts = [p.name, p.street, p.city ?? p.town ?? p.village, p.postcode]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe adjacent identical parts
    return {
      label: parts.join(', '),
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    };
  });
}
