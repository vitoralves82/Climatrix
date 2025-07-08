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

  // Função para criar popup com informações
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      const popupContent = `
        <div style="font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0;">Informações do Ponto</h3>
          <p><strong>Valor exposto:</strong> R$ ${props.value.toLocaleString('pt-BR')}</p>
          <p><strong>Perda anual esperada:</strong> R$ ${props.eai.toFixed(2).replace('.', ',')}</p>
          <p><strong>Coordenadas:</strong> ${feature.geometry.coordinates[1]}°, ${feature.geometry.coordinates[0]}°</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

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
      {data && (
        <GeoJSON
          data={data}
          pointToLayer={(feature, latlng) => {
            // Tamanho do círculo baseado no valor do EAI
            const radius = feature.properties.eai > 0 ? 
              Math.min(15, 5 + Math.log10(feature.properties.eai + 1)) : 5;
            
            return L.circleMarker(latlng, {
              radius: radius,
              color: 'red',
              fillColor: feature.properties.eai > 0 ? 'red' : 'orange',
              fillOpacity: 0.7,
              weight: 2,
            });
          }}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
}
