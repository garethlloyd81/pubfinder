import { useState } from 'react';
import LocationInput from './components/LocationInput';
import MapView from './components/MapView';
import PubList from './components/PubList';
import { geocode } from './utils/geocode';
import { midpoint } from './utils/midpoint';
import { fetchPubs } from './utils/overpass';
import './App.css';

const DEFAULT_RADIUS = 1000;

export default function App() {
  const [locationA, setLocationA] = useState(null);
  const [locationB, setLocationB] = useState(null);
  const [mid, setMid] = useState(null);
  const [pubs, setPubs] = useState(null);
  const [selectedPub, setSelectedPub] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function resolveLocation(input) {
    if (typeof input === 'string') {
      return await geocode(input);
    }
    return input;
  }

  async function handleSearch(locA, locB, searchRadius = radius) {
    if (!locA || !locB) return;
    setLoading(true);
    setError(null);
    setPubs(null);
    setSelectedPub(null);
    try {
      const [resolvedA, resolvedB] = await Promise.all([
        resolveLocation(locA),
        resolveLocation(locB),
      ]);
      setLocationA(resolvedA);
      setLocationB(resolvedB);
      const mp = midpoint(resolvedA, resolvedB);
      setMid(mp);
      const results = await fetchPubs(mp.lat, mp.lng, searchRadius);
      setPubs(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <div className="app">
      <header>
        <h1>🍺 Pub Finder</h1>
        <p>Find a pub halfway between two people</p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <LocationInput label="Person A" onLocate={handleLocateA} disabled={loading} />
          <LocationInput label="Person B" onLocate={handleLocateB} disabled={loading} />

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

          {error && <p className="error">{error}</p>}
          {loading && <p className="loading">Searching…</p>}

          {pubs && (
            <div className="results-header">
              <h2>{pubs.length} pub{pubs.length !== 1 ? 's' : ''} found</h2>
            </div>
          )}

          <PubList pubs={pubs} onSelect={setSelectedPub} selected={selectedPub} />
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
          />
        </main>
      </div>
    </div>
  );
}
