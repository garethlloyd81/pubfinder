const TFL_BASE = 'https://api.tfl.gov.uk/Journey/JourneyResults';
const TRANSIT_MODES = 'tube,dlr,overground,elizabeth-line,bus,national-rail,tflrail';

async function fetchJourney(from, to) {
  const fromStr = `${from.lat},${from.lng}`;
  const toStr = `${to.lat},${to.lng}`;
  const url = `${TFL_BASE}/${encodeURIComponent(fromStr)}/to/${encodeURIComponent(toStr)}?mode=${TRANSIT_MODES}`;
  console.log('[TfL] URL:', url);
  const res = await fetch(url);
  console.log('[TfL] Status:', res.status);
  if (res.status === 404) { console.log('[TfL] 404 – no journey found'); return null; }
  if (!res.ok) throw new Error(`TfL API error: ${res.status}`);
  const data = await res.json();
  const journey = data?.journeys?.[0] ?? null;
  console.log('[TfL] Journey:', journey ? `duration=${journey.duration} legs=${journey.legs?.length}` : 'null (empty journeys array)');
  return journey;
}

export function parseJourney(journey) {
  if (!journey) return null;
  if (!Array.isArray(journey.legs)) return null;
  return {
    duration: journey.duration,
    legs: journey.legs.map((leg) => ({
      summary: leg.instruction?.summary ?? `${leg.mode?.name ?? ''} to ${leg.arrivalPoint?.commonName ?? ''}`,
      mode: leg.mode?.name ?? 'walking',
      duration: leg.duration,
      departureName: leg.departurePoint?.commonName ?? '',
      arrivalName: leg.arrivalPoint?.commonName ?? '',
      departureLat: leg.departurePoint?.lat,
      departureLng: leg.departurePoint?.lon,
      arrivalLat: leg.arrivalPoint?.lat,
      arrivalLng: leg.arrivalPoint?.lon,
    })),
  };
}

export async function getJourneyDetails(from, to) {
  const journey = await fetchJourney(from, to);
  return parseJourney(journey);
}

// Returns pubs with timeA/timeB only — full journey details are fetched on demand via getJourneyDetails.
export async function routePubs(pubs, locationA, locationB, limit = 10) {
  const candidates = pubs.slice(0, limit);
  const results = [];

  for (const pub of candidates) {
    const [timeA, timeB] = await Promise.all([
      fetchJourney(locationA, pub).then((j) => j?.duration ?? null).catch(() => null),
      fetchJourney(locationB, pub).then((j) => j?.duration ?? null).catch(() => null),
    ]);
    results.push({ ...pub, timeA, timeB });
  }

  return results.sort((a, b) => {
    const scoreA = Math.max(a.timeA ?? Infinity, a.timeB ?? Infinity);
    const scoreB = Math.max(b.timeA ?? Infinity, b.timeB ?? Infinity);
    return scoreA - scoreB;
  });
}
