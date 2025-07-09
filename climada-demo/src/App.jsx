import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

export default function App() {
  const [data, setData] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('scenario1');
  const API_BASE = 'https://climatrix-api.onrender.com';
  // Definição dos cenários
  const scenarios = {
    scenario1: {
      file: '/scenario1_irma.geojson', // arquivo original
      name: 'Furacão Irma (2017)',
      description: 'Caribe Oriental - 5 pontos de exposição',
      center: [20, -65],
      zoom: 5
    },
    scenario2: {
      file: '/scenario2_matthew.geojson',
      name: 'Furacão Matthew (2016)',
      description: 'Haiti/Cuba - 10 pontos de exposição',
      center: [19, -74],
      zoom: 6
    },
    scenario3: {
      file: '/scenario3_maria.geojson',
      name: 'Furacão Maria (2017)',
      description: 'Porto Rico - 8 pontos de alta exposição',
      center: [18.2, -66.5],
      zoom: 8
    }
  };

  // Carregar dados quando cenário mudar
  useEffect(() => {
    setLoading(true);
    const scenario = scenarios[selectedScenario];
    

  useEffect(() => {
    setLoading(true);
  
    const payload = {
      hazard_type: 'TC',
      event_id: scenario.eventId,   // ajuste conforme seu objeto "scenario"
      exposure: [],                 // ← preencha depois
      resolution: 1.0
    };
  
    fetch(`${API_BASE}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(d => {
        setData(d);        // GeoJSON retornado pela API
        setLoading(false);
      })
      .catch(err => {
        console.error('Falha ao calcular cenário:', err);
        setLoading(false);
      });
  }, [selectedScenario]);


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

  const currentScenario = scenarios[selectedScenario];

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
          Protótipo usando CLIMADA v6.0.1
        </p>
      </div>

      {/* Seletor de Cenários */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '8px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
          Selecione o Cenário:
        </h3>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            marginBottom: '10px',
            cursor: 'pointer'
          }}
        >
          {Object.entries(scenarios).map(([key, scenario]) => (
            <option key={key} value={key}>
              {scenario.name}
            </option>
          ))}
        </select>
        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#666' }}>
          {currentScenario.description}
        </p>
        {loading && (
          <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#007bff' }}>
            Carregando cenário...
          </p>
        )}
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

      {/* Estatísticas do Cenário */}
      <div style={{
        position: 'absolute',
        top: '230px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
          Resumo do Cenário:
        </h4>
        {data && (
          <div style={{ fontSize: '13px', color: '#666' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Pontos analisados:</strong> {data.features.length}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Exposição total:</strong> R$ {
                data.features.reduce((sum, f) => sum + f.properties.value, 0)
                  .toLocaleString('pt-BR')
              }
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Perda total esperada:</strong> R$ {
                data.features.reduce((sum, f) => sum + f.properties.eai, 0)
                  .toFixed(2).replace('.', ',')
              }
            </p>
          </div>
        )}
      </div>

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
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>Legenda</h3>
        <div style={{ fontSize: '14px', color: '#555' }}>
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
            <span style={{ color: '#555' }}>Área com perda esperada</span>
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
            <span style={{ color: '#555' }}>Área sem perda esperada</span>
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
            <li><strong>Dados reais:</strong> Trajetórias de furacões históricos do IBTrACS</li>
            <li><strong>Dados fictícios:</strong> Pontos de exposição com valores variados</li>
            <li><strong>Cálculo:</strong> Perda Anual Esperada (EAI) usando curvas de dano dos EUA</li>
          </ul>

          <h3 style={{ color: '#444' }}>Cenários disponíveis:</h3>
          <ul style={{ color: '#555' }}>
            <li><strong>Irma 2017:</strong> Devastou Caribe e Florida</li>
            <li><strong>Matthew 2016:</strong> Impactou Haiti, Cuba e EUA</li>
            <li><strong>Maria 2017:</strong> Destruiu Porto Rico</li>
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
            <li>Cenários pré-calculados (não dinâmicos)</li>
            <li>Curvas de dano genéricas dos EUA</li>
            <li>Sem ajuste para moeda ou inflação</li>
          </ul>

          <h3 style={{ color: '#444' }}>Próximas melhorias:</h3>
          <ul style={{ color: '#555' }}>
            <li>Cálculo em tempo real via API</li>
            <li>Upload de dados reais de exposição</li>
            <li>Mais tipos de hazards (enchentes, secas)</li>
            <li>Curvas de vulnerabilidade brasileiras</li>
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
        key={selectedScenario} // força recriação quando muda cenário
        center={currentScenario.center}
        zoom={currentScenario.zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap | CLIMADA Engine"
        />
        {data && !loading && (
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
