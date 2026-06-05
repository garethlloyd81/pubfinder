import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix default marker icons broken by Vite's asset handling
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

function FitBounds({ locationA, locationB, mid }) {
  const map = useMap();
  useEffect(() => {
    if (locationA && locationB) {
      map.fitBounds([
        [locationA.lat, locationA.lng],
        [locationB.lat, locationB.lng],
      ], { padding: [60, 60] });
    } else if (mid) {
      map.setView([mid.lat, mid.lng], 14);
    }
  }, [locationA, locationB, mid, map]);
  return null;
}

export default function MapView({ locationA, locationB, mid, pubs, radius, selectedPub, onSelectPub }) {
  const center = mid ?? locationA ?? { lat: 51.505, lng: -0.09 };

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={12} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds locationA={locationA} locationB={locationB} mid={mid} />

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

      {mid && (
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
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
