/*  ───────────────────  App.jsx  ─────────────────── */
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

const API_BASE = 'https://climatrix-api.onrender.com';

/* ----------- dados “hard-coded” para demo ------------ */
const scenarios = {
  scenario1: { file: '/scenario1_irma.geojson', name: 'Furacão Irma (2017)', center: [20, -65], zoom: 5 },
  scenario2: { file: '/scenario2_matthew.geojson', name: 'Furacão Matthew (2016)', center: [19, -74], zoom: 6 },
  scenario3: { file: '/scenario3_maria.geojson', name: 'Furacão Maria (2017)', center: [18.2, -66.5], zoom: 8 }
};
/* ---------------------------------------------------- */

export default function App() {
  const [mode, setMode]             = useState('preset');   // 'preset' ou 'custom'
  const [selected, setSelected]     = useState('scenario1');
  const [csvText, setCsvText]       = useState('');         // textarea
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);

  /* --- sempre que “mode” ou “selected” ou “csvText” mudarem --- */
  useEffect(() => {
    if (mode === 'preset') {
      loadPreset();
    } else if (mode === 'custom' && csvText.trim()) {
      calcFromCsv();
    } else {
      setData(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selected]);

  /* -------- funções auxiliares -------- */
  async function loadPreset() {
    try {
      setLoading(true);
      const geo = await (await fetch(scenarios[selected].file)).json();
      const exposure = geo.features.map(f => ({
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        value: f.properties?.value ?? 1_000_000
      }));
      await callApi(exposure);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function parseCsv(text) {
    // formato: lat,lon,value  (uma linha por ponto)
    return text.trim().split('\n').map(line => {
      const [lat, lon, value] = line.split(',').map(s => parseFloat(s.trim()));
      return { lat, lon, value: value || 1_000_000 };
    });
  }

  async function calcFromCsv() {
    try {
      setLoading(true);
      const exposure = parseCsv(csvText);
      await callApi(exposure);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function callApi(exposure) {
    const payload = { hazard_type: 'TC', event_id: 'dummy', exposure, resolution: 1.0 };
    const res     = await fetch(`${API_BASE}/api/calculate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(res.statusText);
    setData(await res.json());
  }

  /* -------- UI -------- */
  const mapCenter = mode === 'preset'
      ? scenarios[selected].center
      : [20, -60];                    // centro default para custom
  const mapZoom   = mode === 'preset'
      ? scenarios[selected].zoom
      : 4;

  return (
    <div style={{ height:'100vh', width:'100%', position:'relative' }}>
      {/* cabeçalho simples */}
      <div style={{position:'absolute',top:0,left:0,right:0,
        background:'rgba(255,255,255,0.95)',padding:15,zIndex:1000}}>
        <h1 style={{margin:0,fontSize:22,color:'#333'}}>
          Climatrix – Precificação de Risco Climático
        </h1>
      </div>

      {/* painel esquerdo */}
      <div style={{
        position:'absolute',top:80,left:20,zIndex:1000,
        background:'rgba(255,255,255,0.95)',padding:20,borderRadius:8,maxWidth:300
      }}>
        {/* modo */}
        <div style={{marginBottom:10}}>
          <label>
            <input type="radio" value="preset" checked={mode==='preset'}
              onChange={()=>setMode('preset')}/> Cenários prontos
          </label>{' '}
          <label>
            <input type="radio" value="custom" checked={mode==='custom'}
              onChange={()=>setMode('custom')}/> Meus dados (CSV)
          </label>
        </div>

        {mode === 'preset' ? (
          <>
            <select
              value={selected}
              onChange={e=>setSelected(e.target.value)}
              style={{width:'100%',padding:8,fontSize:14}}>
              {Object.entries(scenarios).map(([k,s])=>(
                <option key={k} value={k}>{s.name}</option>
              ))}
            </select>
            <p style={{fontSize:13,color:'#666'}}>
              {scenarios[selected].description}
            </p>
          </>
        ) : (
          <>
            <textarea
              rows={5}
              placeholder="lat,lon,value\n25,-80,1000000"
              value={csvText}
              onChange={e=>setCsvText(e.target.value)}
              style={{width:'100%',fontFamily:'monospace'}} />
            <button onClick={calcFromCsv} disabled={loading || !csvText.trim()}>
              {loading ? 'Calculando…' : 'Calcular'}
            </button>
          </>
        )}
      </div>

      {/* mapa */}
      <MapContainer center={mapCenter} zoom={mapZoom} style={{height:'100%',width:'100%'}}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='© OpenStreetMap'/>
        {data && !loading && (
          <GeoJSON data={data}
            pointToLayer={(f,latlng)=>L.circleMarker(latlng,{radius:8,color:'red',fillColor:'red',fillOpacity:0.7})}
            onEachFeature={(f,l)=>l.bindPopup(`EAI R$ ${(f.properties.eai).toFixed(2)}`)} />
        )}
      </MapContainer>
    </div>
  );
}
