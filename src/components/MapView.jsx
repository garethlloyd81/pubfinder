import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const personAIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const personBIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const midpointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const pubIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const MODE_COLORS = {
  walking: '#94a3b8',
  tube: '#003688',
  bus: '#d43028',
  'elizabeth-line': '#6950a1',
  dlr: '#00a4a7',
  overground: '#ee7c0e',
  'national-rail': '#003c88',
  tflrail: '#003c88',
};

function FitBounds({ locationA, locationB, mid, selectedPub }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPub && locationA && locationB) {
      map.fitBounds([
        [locationA.lat, locationA.lng],
        [locationB.lat, locationB.lng],
        [selectedPub.lat, selectedPub.lng],
      ], { padding: [60, 60] });
    } else if (locationA && locationB) {
      map.fitBounds([
        [locationA.lat, locationA.lng],
        [locationB.lat, locationB.lng],
      ], { padding: [60, 60] });
    } else if (mid) {
      map.setView([mid.lat, mid.lng], 14);
    }
  }, [locationA, locationB, mid, selectedPub, map]);
  return null;
}

function TransitRouteLines({ journey, color }) {
  if (!journey?.legs) return null;
  return journey.legs.map((leg, i) => {
    if (leg.departureLat == null || leg.arrivalLat == null) return null;
    const isWalking = leg.mode === 'walking';
    return (
      <Polyline
        key={i}
        positions={[[leg.departureLat, leg.departureLng], [leg.arrivalLat, leg.arrivalLng]]}
        pathOptions={{
          color: isWalking ? color : (MODE_COLORS[leg.mode] ?? color),
          weight: isWalking ? 2 : 4,
          dashArray: isWalking ? '5, 8' : null,
          opacity: 0.8,
        }}
      />
    );
  });
}

function WalkingRouteLines({ route, color }) {
  if (!route?.coordinates?.length) return null;
  return (
    <Polyline
      positions={route.coordinates}
      pathOptions={{ color, weight: 4, opacity: 0.8 }}
    />
  );
}

export default function MapView({ locationA, locationB, mid, pubs, radius, selectedPub, onSelectPub, mode, routeA, routeB }) {
  const center = mid ?? locationA ?? { lat: 51.505, lng: -0.09 };

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={12} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds locationA={locationA} locationB={locationB} mid={mid} selectedPub={selectedPub} />

      {locationA && (
        <Marker position={[locationA.lat, locationA.lng]} icon={personAIcon}>
          <Popup>Person A: {locationA.display}</Popup>
        </Marker>
      )}

      {locationB && (
        <Marker position={[locationB.lat, locationB.lng]} icon={personBIcon}>
          <Popup>Person B: {locationB.display}</Popup>
        </Marker>
      )}

      {mid && !selectedPub && (
        <>
          <Marker position={[mid.lat, mid.lng]} icon={midpointIcon}>
            <Popup>Midpoint</Popup>
          </Marker>
          <Circle
            center={[mid.lat, mid.lng]}
            radius={radius}
            pathOptions={{ color: '#f59e0b', fillColor: '#fef3c7', fillOpacity: 0.2 }}
          />
        </>
      )}

      {pubs?.map((pub) => (
        <Marker
          key={pub.id}
          position={[pub.lat, pub.lng]}
          icon={pubIcon}
          eventHandlers={{ click: () => onSelectPub(pub) }}
        >
          <Popup>
            <strong>{pub.name}</strong>
            {pub.address && <><br />{pub.address}</>}
            {pub.opening_hours && <><br />{pub.opening_hours}</>}
            {pub.website && <><br /><a href={pub.website} target="_blank" rel="noreferrer">Website</a></>}
            {mode === 'transit' && pub.timeA != null && (
              <><br /><span style={{ fontSize: '0.85em', color: '#555' }}>A: {pub.timeA} min &nbsp; B: {pub.timeB != null ? `${pub.timeB} min` : '—'}</span></>
            )}
          </Popup>
        </Marker>
      ))}

      {selectedPub && mode === 'transit' && (
        <>
          <TransitRouteLines journey={routeA} color="#3b82f6" />
          <TransitRouteLines journey={routeB} color="#ef4444" />
        </>
      )}

      {selectedPub && mode === 'crowflies' && (
        <>
          <WalkingRouteLines route={routeA} color="#3b82f6" />
          <WalkingRouteLines route={routeB} color="#ef4444" />
        </>
      )}
    </MapContainer>
  );
}
