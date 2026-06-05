function JourneyTimes({ timeA, timeB }) {
  if (timeA == null && timeB == null) return null;
  const worst = Math.max(timeA ?? 0, timeB ?? 0);
  return (
    <div className="journey-times">
      <span className="journey-a" title="Person A journey time">
        A: {timeA != null ? `${timeA} min` : '—'}
      </span>
      <span className="journey-b" title="Person B journey time">
        B: {timeB != null ? `${timeB} min` : '—'}
      </span>
      <span className="journey-worst" title="Longest journey">
        max {worst} min
      </span>
    </div>
  );
}

export default function PubList({ pubs, onSelect, selected, mode }) {
  if (!pubs) return null;
  if (pubs.length === 0) return <p className="no-results">No pubs found nearby. Try increasing the search radius.</p>;

  return (
    <ul className="pub-list">
      {pubs.map((pub) => (
        <li
          key={pub.id}
          className={`pub-item${selected?.id === pub.id ? ' selected' : ''}`}
          onClick={() => onSelect(pub)}
        >
          <strong>{pub.name}</strong>
          {pub.address && <span>{pub.address}</span>}
          {pub.opening_hours && <span className="hours">{pub.opening_hours}</span>}
          {mode === 'transit' && <JourneyTimes timeA={pub.timeA} timeB={pub.timeB} />}
        </li>
      ))}
    </ul>
  );
}
