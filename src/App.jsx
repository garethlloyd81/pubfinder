import { useState } from 'react';
import LocationInput from './components/LocationInput';
import MapView from './components/MapView';
import PubList from './components/PubList';
import { geocode } from './utils/geocode';
import { midpoint } from './utils/midpoint';
import { fetchPubs } from './utils/geoapify';
import { routePubs } from './utils/tfl';
import './App.css';

const DEFAULT_RADIUS = 500;

export default function App() {
  const [locationA, setLocationA] = useState(null);
  const [locationB, setLocationB] = useState(null);
  const [mid, setMid] = useState(null);
  const [pubs, setPubs] = useState(null);
  const [selectedPub, setSelectedPub] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [mode, setMode] = useState('crowflies'); // 'crowflies' | 'transit'
  const [loading, setLoading] = useState(false);
  const [routingProgress, setRoutingProgress] = useState(null);
  const [error, setError] = useState(null);

  async function resolveLocation(input) {
    if (typeof input === 'string') return await geocode(input);
    return input;
  }

  async function handleSearch(locA, locB, searchRadius = radius, searchMode = mode) {
    if (!locA || !locB) return;
    setLoading(true);
    setError(null);
    setPubs(null);
    setSelectedPub(null);
    setRoutingProgress(null);

    try {
      const [resolvedA, resolvedB] = await Promise.all([
        resolveLocation(locA),
        resolveLocation(locB),
      ]);
      setLocationA(resolvedA);
      setLocationB(resolvedB);

      const mp = midpoint(resolvedA, resolvedB);
      setMid(mp);

      const rawPubs = await fetchPubs(mp.lat, mp.lng, searchRadius);

      if (searchMode === 'transit') {
        setLoading(false);
        setRoutingProgress(`Calculating transit times for ${Math.min(rawPubs.length, 10)} pubs…`);
        const routed = await routePubs(rawPubs, resolvedA, resolvedB);
        setRoutingProgress(null);
        setPubs(routed);
      } else {
        setPubs(rawPubs);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setRoutingProgress(null);
    }
  }

  async function handleLocateA(input) {
    try {
      const resolved = await resolveLocation(input);
      setLocationA(resolved);
      if (locationB) handleSearch(resolved, locationB);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLocateB(input) {
    try {
      const resolved = await resolveLocation(input);
      setLocationB(resolved);
      if (locationA) handleSearch(locationA, resolved);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleRadiusChange(e) {
    const val = Number(e.target.value);
    setRadius(val);
    if (locationA && locationB) handleSearch(locationA, locationB, val);
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    if (locationA && locationB) handleSearch(locationA, locationB, radius, newMode);
  }

  return (
    <div className="app">
      <header>
        <h1>🍺 Pub Finder</h1>
        <p>Find a pub halfway between two people</p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <LocationInput label="Person A" onLocate={handleLocateA} disabled={loading || !!routingProgress} />
          <LocationInput label="Person B" onLocate={handleLocateB} disabled={loading || !!routingProgress} />

          <div className="mode-toggle">
            <button
              className={mode === 'crowflies' ? 'active' : ''}
              onClick={() => handleModeChange('crowflies')}
            >
              🐦 As the crow flies
            </button>
            <button
              className={mode === 'transit' ? 'active' : ''}
              onClick={() => handleModeChange('transit')}
            >
              🚇 Public transport
            </button>
          </div>

          {mode === 'transit' && (
            <p className="mode-note">
              Uses TfL Journey Planner. Works within Greater London.
              Ranked by fairness — minimises the longer of the two journeys.
            </p>
          )}

          <div className="radius-control">
            <label>Search radius: <strong>{(radius / 1000).toFixed(1)} km</strong></label>
            <input
              type="range"
              min={250}
              max={5000}
              step={250}
              value={radius}
              onChange={handleRadiusChange}
            />
          </div>

          <div className="sidebar-scroll">
            {error && <p className="error">{error}</p>}
            {loading && <p className="loading">Searching…</p>}
            {routingProgress && <p className="loading">{routingProgress}</p>}

            {pubs && (
              <div className="results-header">
                <h2>{pubs.length} pub{pubs.length !== 1 ? 's' : ''} found</h2>
                {mode === 'transit' && <span className="results-note">Sorted by fairest journey</span>}
              </div>
            )}

            <PubList pubs={pubs} onSelect={setSelectedPub} selected={selectedPub} mode={mode} />
          </div>
        </aside>

        <main className="map-container">
          <MapView
            locationA={locationA}
            locationB={locationB}
            mid={mid}
            pubs={pubs}
            radius={radius}
            selectedPub={selectedPub}
            onSelectPub={setSelectedPub}
            mode={mode}
          />
        </main>
      </div>
    </div>
  );
}
