import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI();
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://climatrix.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

const API_BASE = 'https://climatrix-api.onrender.com';

export default function App() {
  const [data, setData] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('scenario1');

  // ── Cenários disponíveis ──────────────────────────────────────
  const scenarios = {
    scenario1: {
      file: '/scenario1_irma.geojson',
      name: 'Furacão Irma (2017)',
      description: 'Caribe Oriental – 5 pontos de exposição',
      center: [20, -65],
      zoom: 5
    },
    scenario2: {
      file: '/scenario2_matthew.geojson',
      name: 'Furacão Matthew (2016)',
      description: 'Haiti / Cuba – 10 pontos de exposição',
      center: [19, -74],
      zoom: 6
    },
    scenario3: {
      file: '/scenario3_maria.geojson',
      name: 'Furacão Maria (2017)',
      description: 'Porto Rico – 8 pontos de exposição',
      center: [18.2, -66.5],
      zoom: 8
    }
  };

  // ── Carrega dados quando o cenário muda ───────────────────────
  useEffect(() => {
    const loadAndCalc = async () => {
      setLoading(true);
      setData(null);

      try {
        // 1) baixa o GeoJSON local
        const geo = await (await fetch(scenarios[selectedScenario].file)).json();

        // 2) transforma em exposure [{lat, lon, value}]
        const exposure = geo.features.map(f => ({
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          value: f.properties?.value ?? 1_000_000  // valor default se faltar
        }));

        // 3) chama API (stub devolve GeoJSON calculado)
        const payload = {
          hazard_type: 'TC',
          event_id: 'dummy',
          exposure,
          resolution: 1.0
        };

        const res = await fetch(`${API_BASE}/api/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`API ${res.status}`);

        const geoOut = await res.json();
        setData(geoOut);
      } catch (err) {
        console.error('Falha:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAndCalc();
  }, [selectedScenario]);

  // ── Popup de cada ponto ───────────────────────────────────────
  const onEachFeature = (feature, layer) => {
    if (!feature.properties) return;
    const p = feature.properties;
    layer.bindPopup(`
      <div style="font-family: Arial">
        <h4 style="margin-top:0">Risco</h4>
        Valor: R$ ${p.value.toLocaleString('pt-BR')}<br/>
        EAI: R$ ${p.eai.toFixed(2).replace('.', ',')}
      </div>
    `);
  };

  const current = scenarios[selectedScenario];

  // ── UI / Mapa ─────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* cabeçalho */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)', padding: 15, zIndex: 1000 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#333' }}>
          Climatrix – Precificação de Risco Climático
        </h1>
      </div>

      {/* seletor de cenário */}
      <div style={{
        position: 'absolute', top: 80, left: 20, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', padding: 20, borderRadius: 8, maxWidth: 280
      }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>Selecione o cenário</h3>
        <select
          value={selectedScenario}
          onChange={e => setSelectedScenario(e.target.value)}
          style={{ width: '100%', padding: 8, fontSize: 14 }}
        >
          {Object.entries(scenarios).map(([k, s]) => (
            <option key={k} value={k}>{s.name}</option>
          ))}
        </select>
        <p style={{ fontSize: 13, color: '#666' }}>{current.description}</p>
        {loading && <p style={{ fontSize: 13, color: '#007bff' }}>Calculando…</p>}
      </div>

      {/* botão info */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        style={{ position: 'absolute', top: 80, right: 20, zIndex: 1000 }}
      >
        ℹ️ Sobre
      </button>

      {/* mapa */}
      <MapContainer
        key={selectedScenario}
        center={current.center}
        zoom={current.zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {data && !loading && (
          <GeoJSON
            data={data}
            pointToLayer={(feature, latlng) =>
              L.circleMarker(latlng, {
                radius: 8,
                color: 'red',
                fillColor: 'red',
                fillOpacity: 0.7,
                weight: 1
              })
            }
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* modal simples */}
      {showInfo && (
        <>
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1100
          }} onClick={() => setShowInfo(false)} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', background: '#fff',
            padding: 30, borderRadius: 8, zIndex: 1200, maxWidth: 500
          }}>
            <h2>Protótipo Climatrix</h2>
            <p>Atualmente devolvendo GeoJSON mock da API.</p>
            <button onClick={() => setShowInfo(false)}>Fechar</button>
          </div>
        </>
      )}
    </div>
  );
}
