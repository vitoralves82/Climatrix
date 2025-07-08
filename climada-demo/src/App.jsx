import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

export default function App() {
  const [data, setData] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetch('/impact.geojson')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(err => console.error('Falha no fetch:', err));
  }, []);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      const popupContent = `
        <div style="font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0;">Análise de Risco</h3>
          <p><strong>Valor exposto:</strong> R$ ${props.value.toLocaleString('pt-BR')}</p>
          <p><strong>Perda anual esperada:</strong> R$ ${props.eai.toFixed(2).replace('.', ',')}</p>
          <p><strong>Coordenadas:</strong> ${feature.geometry.coordinates[1]}°, ${feature.geometry.coordinates[0]}°</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          Climatrix - Precificação de Risco Climático
        </h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
          Protótipo usando CLIMADA v6.0.1 | Furacão Irma (2017)
        </p>
      </div>

      {/* Botão de Informações */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          zIndex: 1000,
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        ℹ️ Sobre este modelo
      </button>

      {/* Legenda */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Legenda</h3>
        <div style={{ fontSize: '14px' }}>
          <div style={{ marginBottom: '5px' }}>
            <span style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              background: 'red',
              borderRadius: '50%',
              marginRight: '10px',
              verticalAlign: 'middle'
            }}></span>
            Área com perda esperada
          </div>
          <div>
            <span style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              background: 'orange',
              borderRadius: '50%',
              marginRight: '10px',
              verticalAlign: 'middle'
            }}></span>
            Área sem perda esperada
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
            Tamanho do círculo = magnitude do risco
          </p>
        </div>
      </div>

      {/* Modal de Informações */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 2000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <button
            onClick={() => setShowInfo(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
          
          <h2 style={{ marginTop: 0, color: '#333' }}>Sobre este Modelo</h2>
          
          <h3 style={{ color: '#444' }}>O que você está vendo:</h3>
          <ul style={{ color: '#555' }}>
            <li><strong>Dados reais:</strong> Trajetória do Furacão Irma (2017) obtida do IBTrACS</li>
            <li><strong>Dados fictícios:</strong> 5 pontos de exposição com valores de R$ 1-2 milhões</li>
            <li><strong>Cálculo:</strong> Perda Anual Esperada (EAI) usando curvas de dano dos EUA</li>
          </ul>

          <h3 style={{ color: '#444' }}>Como funciona:</h3>
          <ol style={{ color: '#555' }}>
            <li>CLIMADA simula o campo de vento do furacão</li>
            <li>Aplica curvas de vulnerabilidade aos ativos expostos</li>
            <li>Calcula as perdas esperadas por localização</li>
          </ol>

          <h3 style={{ color: '#444' }}>Limitações atuais:</h3>
          <ul style={{ color: '#555' }}>
            <li>Exposição fictícia (não são ativos reais)</li>
            <li>Apenas um evento histórico (Irma 2017)</li>
            <li>Curvas de dano genéricas dos EUA</li>
            <li>Sem ajuste para moeda ou inflação</li>
          </ul>

          <h3 style={{ color: '#444' }}>Próximas melhorias:</h3>
          <ul style={{ color: '#555' }}>
            <li>Permitir upload de dados reais de exposição</li>
            <li>Escolher diferentes eventos climáticos</li>
            <li>Ajustar parâmetros de vulnerabilidade</li>
            <li>Calcular em tempo real via API</li>
          </ul>

          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <strong>Desenvolvido por:</strong> EnvironPact | 
            <strong> Engine:</strong> CLIMADA v6.0.1 (ETH Zürich)
          </p>
        </div>
      )}

      {/* Overlay escuro quando modal aberto */}
      {showInfo && (
        <div
          onClick={() => setShowInfo(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1999
          }}
        />
      )}

      {/* Mapa */}
      <MapContainer
        center={[20, -65]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap | CLIMADA Engine"
        />
        {data && (
          <GeoJSON
            data={data}
            pointToLayer={(feature, latlng) => {
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
    </div>
  );
}
