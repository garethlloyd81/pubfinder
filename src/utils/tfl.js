const TFL_BASE = 'https://api.tfl.gov.uk/Journey/JourneyResults';
const TRANSIT_MODES = 'tube,dlr,overground,elizabeth-line,bus,national-rail,tflrail';

export async function getJourneyTime(from, to) {
  const fromStr = `${from.lat},${from.lng}`;
  const toStr = `${to.lat},${to.lng}`;
  const url = `${TFL_BASE}/${encodeURIComponent(fromStr)}/to/${encodeURIComponent(toStr)}?mode=${TRANSIT_MODES}`;

  const res = await fetch(url);

  if (res.status === 404) return null; // No journey found (outside London or no route)
  if (!res.ok) throw new Error(`TfL API error: ${res.status}`);

  const data = await res.json();
  const journeys = data?.journeys;
  if (!journeys?.length) return null;

  return journeys[0].duration; // minutes
}

// Routes the top N pubs (by distance from midpoint) and returns pubs with journey times.
// Uses sequential requests to avoid rate limiting.
export async function routePubs(pubs, locationA, locationB, limit = 10) {
  const candidates = pubs.slice(0, limit);
  const results = [];

  for (const pub in candidates) {
    const [timeA, timeB] = await Promise.all([
      getJourneyTime(locationA, candidates[pub]).catch(() => null),
      getJourneyTime(locationB, candidates[pub]).catch(() => null),
    ]);
    results.push({ ...candidates[pub], timeA, timeB });
  }

  return results.sort((a, b) => {
    const scoreA = Math.max(a.timeA ?? Infinity, a.timeB ?? Infinity);
    const scoreB = Math.max(b.timeA ?? Infinity, b.timeB ?? Infinity);
    return scoreA - scoreB;
  });
}
