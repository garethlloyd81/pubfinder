import { useState } from 'react';

export default function LocationInput({ label, onLocate, disabled }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setValue('My location');
        onLocate({ lat, lng, display: 'My location' });
        setLoading(false);
      },
      () => {
        setError('Could not get your location');
        setLoading(false);
      }
    );
  }

  return (
    <div className="location-input">
      <label>{label}</label>
      <div className="input-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a town, city or postcode"
          disabled={disabled || loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              onLocate(value.trim());
            }
          }}
        />
        <button
          onClick={() => value.trim() && onLocate(value.trim())}
          disabled={disabled || loading || !value.trim()}
        >
          Go
        </button>
        <button onClick={useMyLocation} disabled={disabled || loading} title="Use my location">
          📍
        </button>
      </div>
      {error && <span className="error">{error}</span>}
    </div>
  );
}
