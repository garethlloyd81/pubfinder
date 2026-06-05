const MODE_ICONS = {
  walking: '🚶',
  tube: '🚇',
  bus: '🚌',
  'elizabeth-line': '🟣',
  dlr: '🚈',
  overground: '🟠',
  'national-rail': '🚆',
  tflrail: '🚆',
};

const MODE_COLORS = {
  walking: '#6b7280',
  tube: '#003688',
  bus: '#d43028',
  'elizabeth-line': '#6950a1',
  dlr: '#00a4a7',
  overground: '#ee7c0e',
  'national-rail': '#003c88',
  tflrail: '#003c88',
};

function formatDistance(metres) {
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${metres} m`;
}

function TransitJourney({ journey }) {
  if (!journey) return <p className="route-unavailable">Route unavailable — location may be outside London.</p>;
  return (
    <div className="journey-legs">
      {journey.legs.map((leg, i) => (
        <div key={i} className="journey-leg" style={{ borderLeftColor: MODE_COLORS[leg.mode] ?? '#475569' }}>
          <div className="leg-header">
            <span className="leg-icon">{MODE_ICONS[leg.mode] ?? '🚌'}</span>
            <span className="leg-summary">{leg.summary}</span>
            <span className="leg-duration">{leg.duration} min</span>
          </div>
          {leg.departureName && (
            <div className="leg-stops">
              <span>{leg.departureName}</span>
              <span className="leg-arrow">→</span>
              <span>{leg.arrivalName}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function WalkingJourney({ route }) {
  if (!route) return <p className="route-unavailable">Walking route unavailable.</p>;
  return (
    <div className="journey-legs">
      <div className="walk-summary">
        🚶 {route.duration} min &nbsp;·&nbsp; {formatDistance(route.distance)}
      </div>
      {route.steps.map((step, i) => (
        <div key={i} className="walk-step">
          <span className="step-distance">{step.distance}m</span>
          <span>{step.instruction}</span>
        </div>
      ))}
    </div>
  );
}

export default function RoutePanel({ pub, mode, routeA, routeB, routesLoading, onBack }) {
  return (
    <div className="route-panel">
      <button className="back-btn" onClick={onBack}>← Back to results</button>

      <div className="route-pub-info">
        <strong>{pub.name}</strong>
        {pub.address && <span>{pub.address}</span>}
      </div>

      {routesLoading && <p className="loading">Fetching walking routes…</p>}

      <div className="route-columns">
        <div className="route-column route-column-a">
          <h3>
            <span className="person-dot dot-a" />
            Person A
            {(routeA?.duration ?? pub.timeA) != null && (
              <span className="route-total">{routeA?.duration ?? pub.timeA} min</span>
            )}
          </h3>
          {mode === 'transit'
            ? <TransitJourney journey={pub.journeyA} />
            : <WalkingJourney route={routeA} />}
        </div>

        <div className="route-column route-column-b">
          <h3>
            <span className="person-dot dot-b" />
            Person B
            {(routeB?.duration ?? pub.timeB) != null && (
              <span className="route-total">{routeB?.duration ?? pub.timeB} min</span>
            )}
          </h3>
          {mode === 'transit'
            ? <TransitJourney journey={pub.journeyB} />
            : <WalkingJourney route={routeB} />}
        </div>
      </div>
    </div>
  );
}
