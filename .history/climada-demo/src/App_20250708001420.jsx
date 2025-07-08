import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/impact.geojson')
      .then(r => {
        console.log('Fetch status', r.status);
        return r.json();
      })
      .then(d => {
        console.log('GeoJSON carregado, features:', d.features.length);
        setData(d);
      })
      .catch(err => console.error('Falha no fetch:', err));
  }, []);

  return (
    <MapContainer
      center={[20, -65]}
      zoom={5}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OSM"
      />
      {data && <GeoJSON data={data} />}
    </MapContainer>
  );
  
}
