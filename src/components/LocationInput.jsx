import { useState, useEffect, useRef } from 'react';
import { getSuggestions } from '../utils/autocomplete';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function LocationInput({ label, onLocate, disabled, showLocate = true }) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const suppressAutocomplete = useRef(false);
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      setSuggestions([]);
      return;
    }
    if (suppressAutocomplete.current) {
      suppressAutocomplete.current = false;
      return;
    }
    getSuggestions(debouncedValue)
      .then((results) => {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setActiveIndex(-1);
      })
      .catch(() => setSuggestions([]));
  }, [debouncedValue]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectSuggestion(suggestion) {
    suppressAutocomplete.current = true;
    setValue(suggestion.label);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    onLocate({ lat: suggestion.lat, lng: suggestion.lng, display: suggestion.label });
  }

  function handleKeyDown(e) {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      } else if (value.trim()) {
        setShowSuggestions(false);
        onLocate(value.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

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
        suppressAutocomplete.current = true;
        setValue('My location');
        setSuggestions([]);
        setShowSuggestions(false);
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
    <div className="location-input" ref={containerRef}>
      <label>{label}</label>
      <div className="input-row">
        <input
          type="text"
          value={value}
          onChange={(e) => { suppressAutocomplete.current = false; setValue(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Enter a town, city or postcode"
          disabled={disabled || loading}
          autoComplete="off"
        />
        <button
          onClick={() => { setShowSuggestions(false); value.trim() && onLocate(value.trim()); }}
          disabled={disabled || loading || !value.trim()}
        >
          Go
        </button>
        {showLocate && (
          <button onClick={useMyLocation} disabled={disabled || loading} title="Use my location">
            📍
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className={i === activeIndex ? 'active' : ''}
              onMouseDown={() => selectSuggestion(s)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {error && <span className="error">{error}</span>}
    </div>
  );
}
