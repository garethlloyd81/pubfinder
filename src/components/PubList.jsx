export default function PubList({ pubs, onSelect, selected }) {
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
        </li>
      ))}
    </ul>
  );
}
