import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

export default function App() {
  const [data, setData] = useState(null);

  // Carrega o GeoJSON uma vez
  useEffect(() => {
    fetch('/impact.geojson')
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <MapContainer
      center={[20, -65]} // posição inicial
      zoom={5}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data && <GeoJSON data={data} />}
    </MapContainer>
  );
}
