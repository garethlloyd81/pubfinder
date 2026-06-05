const KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const BASE_URL = 'https://api.geoapify.com/v1/routing';

export async function getWalkingRoute(from, to) {
  const params = new URLSearchParams({
    waypoints: `${from.lat},${from.lng}|${to.lat},${to.lng}`,
    mode: 'walk',
    details: 'instruction_details',
    apiKey: KEY,
  });

  const res = await fetch(`${BASE_URL}?${params}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  const props = feature.properties;
  const coords = feature.geometry.coordinates.flat();

  return {
    coordinates: coords.map(([lng, lat]) => [lat, lng]),
    duration: Math.round(props.time / 60),
    distance: Math.round(props.distance),
    steps: props.legs?.[0]?.steps
      ?.filter((s) => s.distance > 5)
      .map((s) => ({
        instruction: s.instruction.text,
        distance: Math.round(s.distance),
      })) ?? [],
  };
}
