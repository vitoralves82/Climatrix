
import React, { useState } from 'react';
import type { Scenario, CustomAsset } from '../types';

const hazardOptions = [
    'River flood',
    'Tropical Cyclone',
    'Winter Storm (Europe)',
    'Wildfire',
    'Earthquake',
    'Flood',
    'Hail',
    'Aqueduct coastal flood',
    'Relative cropyield'
];

const unitsMap: Record<string, string[]> = {
  'River flood': ['m - metros (profundidade da água)', 'cm - centímetros (profundidade da água)', 'ft - pés (profundidade da água)', 'm/s - metros por segundo (velocidade do fluxo)', 'm³/s - metros cúbicos por segundo (vazão)', 'mm/day - milímetros por dia (precipitação)'],
  'Tropical Cyclone': ['m/s - metros por segundo (velocidade do vento)', 'km/h - quilômetros por hora (velocidade do vento)', 'mph - milhas por hora (velocidade do vento)', 'kn - nós (velocidade do vento)', 'hPa - hectopascal (pressão atmosférica)', 'mbar - milibar (pressão atmosférica)', 'Pa - pascal (pressão atmosférica)'],
  'Winter Storm (Europe)': ['m/s - metros por segundo (velocidade do vento)', 'km/h - quilômetros por hora (velocidade do vento)', 'mph - milhas por hora (velocidade do vento)', 'kn - nós (velocidade do vento)', 'hPa - hectopascal (pressão)', 'mbar - milibar (pressão)', 'N/m² - newtons por metro quadrado (pressão dinâmica)'],
  'Relative cropyield': ['% - percentagem (rendimento relativo)', 'ratio - razão adimensional (0-1)', 'fraction - fração adimensional (0-1)', 't/ha - toneladas por hectare (produtividade)', 'kg/m² - quilogramas por metro quadrado (produtividade)', 'bushel/acre - bushels por acre (produtividade)'],
  'Wildfire': ['MW - megawatts (potência radiativa do fogo)', 'kW/m² - quilowatts por metro quadrado (intensidade do fogo)', 'MJ/m² - megajoules por metro quadrado (energia liberada)', 'km² - quilômetros quadrados (área queimada)', 'ha - hectares (área queimada)', 'm/s - metros por segundo (velocidade de propagação)', '°C - graus Celsius (temperatura)'],
  'Earthquake': ['g - aceleração da gravidade (Peak Ground Acceleration - PGA)', 'm/s² - metros por segundo quadrado (aceleração)', 'cm/s² - centímetros por segundo quadrado (aceleração)', 'Richter - escala Richter (magnitude)', 'Mw - magnitude momento (escala)', 'MMI - Intensidade Mercalli Modificada (escala I-XII)', 'cm/s - centímetros por segundo (velocidade de pico)'],
  'Flood': ['m - metros (profundidade da água)', 'cm - centímetros (profundidade da água)', 'ft - pés (profundidade da água)', 'in - polegadas (profundidade da água)', 'm/s - metros por segundo (velocidade do fluxo)', 'm³/s - metros cúbicos por segundo (vazão)', 'l/s - litros por segundo (vazão)'],
  'Hail': ['mm - milímetros (diâmetro do granizo)', 'cm - centímetros (diâmetro do granizo)', 'in - polegadas (diâmetro do granizo)', 'g - gramas (massa do granizo)', 'kg/m² - quilogramas por metro quadrado (energia cinética)', 'J/m² - joules por metro quadrado (energia de impacto)', 'm/s - metros por segundo (velocidade terminal)'],
  'Aqueduct coastal flood': ['m - metros (elevação do nível do mar)', 'cm - centímetros (elevação do nível do mar)', 'ft - pés (elevação do nível do mar)', 'mm - milímetros (elevação do nível do mar)', 'm/s - metros por segundo (velocidade das ondas)', 'm ASL - metros acima do nível do mar (elevação)', 'm MSL - metros do nível médio do mar (elevação)']
};

const intensityUnitsMap: Record<string, string[]> = {
  'River flood': ['m (water depth)'],
  'Flood': ['m (water depth)'],
  'Aqueduct coastal flood': ['m (water depth)'],
  'Tropical Cyclone': ['m/s (wind speed)'],
  'Winter Storm (Europe)': ['m/s (wind speed)', 'hPa (pressure)'],
  'Relative cropyield': ['% (percentage)', 'ratio (dimensionless)'],
  'Wildfire': ['MW (radiative power)', 'km² (burned area)'],
  'Earthquake': ['g (PGA)', 'Richter (magnitude)'],
  'Hail': ['mm (diameter)', 'kg/m² (kinetic energy)'],
};

const frequencyUnits = [
  'Events per year (1/year)',
  'Annual exceedance probability (dimensionless, 0-1)',
  'Return period (years)',
];

const fractionUnits = [
    'Dimensionless ratio (0-1)',
    'Percentage (0-100%)',
];

const climaticScenarios = {
  'ssp1-2.6': 'SSP1-2.6 (Sustentabilidade)',
  'ssp2-4.5': 'SSP2-4.5 (Caminho Intermediário)',
  'ssp5-8.5': 'SSP5-8.5 (Alta Emissão)'
};

interface ControlsMenuProps {
    onNavigateToMap: () => void;
    onNavigateToResults: () => void;
    scenarios: Scenario[];
    selectedScenarioId: string;
    onScenarioChange: (id: string) => void;
    loading: boolean;
    description: string;
    customAssets: CustomAsset[];
    onAddAsset: (asset: CustomAsset) => void;
    onRemoveAsset: (id: number) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const DatabaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);

const Panel: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-slate-900/80 border border-slate-800 p-6 rounded-xl shadow-lg ${className}`}>
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        {children}
    </div>
);

const SkeletonLoader = () => (
    <div className="animate-pulse">
        <div className="h-3 bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
    </div>
);

export default function ControlsMenu({ 
    onNavigateToMap, 
    onNavigateToResults,
    scenarios,
    selectedScenarioId,
    onScenarioChange,
    loading,
    description,
    customAssets,
    onAddAsset,
    onRemoveAsset
}: ControlsMenuProps) {
    const [selectedHazard, setSelectedHazard] = useState(hazardOptions[0]);
    const [selectedUnit, setSelectedUnit] = useState(unitsMap[hazardOptions[0]][0]);
    const [selectedClimaticScenario, setSelectedClimaticScenario] = useState('ssp2-4.5');
    
    // Standard hazard conditions state
    const [centroids, setCentroids] = useState('');
    const [eventId, setEventId] = useState('');
    const [frequencyValue, setFrequencyValue] = useState('');
    const [frequencyUnit, setFrequencyUnit] = useState(frequencyUnits[0]);
    const [intensityValue, setIntensityValue] = useState('');
    const [intensityUnit, setIntensityUnit] = useState(intensityUnitsMap[hazardOptions[0]][0]);
    const [fractionValue, setFractionValue] = useState('');
    const [fractionUnit, setFractionUnit] = useState(fractionUnits[0]);

    // Custom assets form state
    const [assetName, setAssetName] = useState('');
    const [assetLat, setAssetLat] = useState('');
    const [assetLon, setAssetLon] = useState('');
    const [assetAltitude, setAssetAltitude] = useState('');
    const [assetValue, setAssetValue] = useState('');
    const [assetRiskType, setAssetRiskType] = useState('RF1');
    const [assetLatError, setAssetLatError] = useState('');
    const [assetLonError, setAssetLonError] = useState('');

    const handleHazardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newHazard = e.target.value;
        setSelectedHazard(newHazard);
        
        const newUnits = unitsMap[newHazard] || [];
        setSelectedUnit(newUnits[0] || '');

        const newIntensityUnits = intensityUnitsMap[newHazard] || [];
        setIntensityUnit(newIntensityUnits[0] || '');
    };

    const handleAddAsset = (e: React.FormEvent) => {
        e.preventDefault();
        setAssetLatError('');
        setAssetLonError('');

        const lat = parseFloat(assetLat);
        const lon = parseFloat(assetLon);
        const altitude = assetAltitude ? parseFloat(assetAltitude) : undefined;
        const value = parseFloat(assetValue);

        let isValid = true;
        if (isNaN(lat) || lat < -90 || lat > 90) {
            setAssetLatError('Latitude deve estar entre -90 e 90.');
            isValid = false;
        }
        if (isNaN(lon) || lon < -180 || lon > 180) {
            setAssetLonError('Longitude deve estar entre -180 e 180.');
            isValid = false;
        }
        
        if (!assetName.trim() || isNaN(value) || value <= 0) {
            isValid = false;
        }

        if (isValid) {
            const newAsset: CustomAsset = { 
                id: Date.now(), 
                name: assetName, 
                lat, 
                lon, 
                altitude,
                value,
                riskType: assetRiskType 
            };
            onAddAsset(newAsset);
            setAssetName(''); setAssetLat(''); setAssetLon(''); setAssetAltitude(''); setAssetValue('');
        }
    };

    const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400/50";
    const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-500";

    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white flex flex-col font-sans">
          <header className="bg-slate-900 text-white p-4 shadow-lg z-10 border-b border-slate-800 flex-shrink-0">
              <div className="container mx-auto flex justify-between items-center">
                  <div>
                      <h1 className="text-2xl font-bold tracking-tight text-white">Climatrix</h1>
                      <p className="text-sm text-slate-300">Controles do Modelo</p>
                  </div>
                  <nav className="flex items-center gap-2 sm:gap-4">
                      <button onClick={onNavigateToMap} className="text-base sm:text-lg font-semibold text-sky-300 hover:text-white transition-colors">Mapa</button>
                      <button onClick={onNavigateToResults} className="text-base sm:text-lg font-semibold text-sky-300 hover:text-white transition-colors">Resultados</button>
                  </nav>
              </div>
          </header>

          <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="space-y-8">
                      <Panel title="Configuração do Hazard">
                          <div className="space-y-4">
                              <div>
                                  <label className="text-sm text-slate-300 block mb-2 font-semibold">Hazard</label>
                                  <select value={selectedHazard} onChange={handleHazardChange} className={inputClass}>
                                      {hazardOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-sm text-slate-300 block mb-2 font-semibold">Units</label>
                                  <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className={inputClass}>
                                      {(unitsMap[selectedHazard] || []).map(unit => (
                                          <option key={unit} value={unit}>{unit}</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                <label className="text-sm text-slate-300 block mb-2 font-semibold">Cenário Climático</label>
                                <select value={selectedClimaticScenario} onChange={(e) => setSelectedClimaticScenario(e.target.value)} className={inputClass}>
                                    {Object.entries(climaticScenarios).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                </select>
                              </div>
                          </div>
                      </Panel>

                      <Panel title="Parâmetros de Simulação">
                         <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Frequência</label>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Valor" value={frequencyValue} onChange={(e) => setFrequencyValue(e.target.value)} className={inputClass} />
                                    <select value={frequencyUnit} onChange={(e) => setFrequencyUnit(e.target.value)} className={inputClass}>
                                        {frequencyUnits.map(unit => (<option key={unit} value={unit}>{unit}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Intensidade</label>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Valor" value={intensityValue} onChange={(e) => setIntensityValue(e.target.value)} className={inputClass} />
                                    <select value={intensityUnit} onChange={(e) => setIntensityUnit(e.target.value)} className={inputClass}>
                                        {(intensityUnitsMap[selectedHazard] || []).map(unit => (<option key={unit} value={unit}>{unit}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Fração</label>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Valor" value={fractionValue} onChange={(e) => setFractionValue(e.target.value)} className={inputClass} />
                                    <select value={fractionUnit} onChange={(e) => setFractionUnit(e.target.value)} className={inputClass}>
                                        {fractionUnits.map(unit => (<option key={unit} value={unit}>{unit}</option>))}
                                    </select>
                                </div>
                            </div>
                         </div>
                      </Panel>
                      <Panel title="Parâmetros Adicionais (Opcional)">
                        <div className="space-y-4">
                            <input type="text" placeholder="Centroids" value={centroids} onChange={(e) => setCentroids(e.target.value)} className={inputClass} />
                            <input type="text" placeholder="ID do evento" value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass} />
                        </div>
                      </Panel>
                  </div>
                  
                  <div className="space-y-8">
                      <Panel title="Cenários Pré-definidos">
                          <select id="scenario-select" value={selectedScenarioId} onChange={(e) => onScenarioChange(e.target.value)} disabled={loading} className={`${inputClass} mb-2 disabled:opacity-50`}>
                              {scenarios.map((scenario) => (
                                  <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
                              ))}
                          </select>
                          <div className="text-xs text-slate-400 h-8 pt-1">
                              {loading ? <SkeletonLoader /> : <p>{description}</p>}
                          </div>
                      </Panel>

                      <Panel title="Ativos e Exposição">
                          <div className="mb-6">
                            <button className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200">
                                <DatabaseIcon />
                                Importar Base de Dados
                            </button>
                          </div>
                          <h4 className="text-md font-semibold text-white mb-3">Adicionar Ativo Manualmente</h4>
                          <form onSubmit={handleAddAsset} className="space-y-3">
                              <input type="text" placeholder="Nome do Ativo" value={assetName} onChange={e => setAssetName(e.target.value)} className={inputClass} required />
                              <div className="flex gap-2">
                                  <div className="w-full">
                                      <input type="number" step="any" placeholder="Latitude (-90 to 90)" value={assetLat} onChange={e => {setAssetLat(e.target.value); setAssetLatError('')}} className={`${inputClass} ${assetLatError ? errorInputClass : ''}`} required />
                                      {assetLatError && <p className="text-xs text-red-400 mt-1">{assetLatError}</p>}
                                  </div>
                                  <div className="w-full">
                                      <input type="number" step="any" placeholder="Longitude (-180 to 180)" value={assetLon} onChange={e => {setAssetLon(e.target.value); setAssetLonError('')}} className={`${inputClass} ${assetLonError ? errorInputClass : ''}`} required />
                                      {assetLonError && <p className="text-xs text-red-400 mt-1">{assetLonError}</p>}
                                  </div>
                              </div>
                              <input type="number" step="any" placeholder="Altitude (m) (Opcional)" value={assetAltitude} onChange={e => setAssetAltitude(e.target.value)} className={inputClass} />
                              <input type="number" placeholder="Valor ($)" value={assetValue} onChange={e => setAssetValue(e.target.value)} className={inputClass} required />
                              <select value={assetRiskType} onChange={e => setAssetRiskType(e.target.value)} className={inputClass}>
                                  <option value="RF1">Risco RF1</option>
                                  <option value="RF2">Risco RF2</option>
                              </select>
                              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200">
                                  Adicionar Ativo
                              </button>
                          </form>
                          <div className="mt-4">
                              {customAssets.length > 0 && <h4 className="text-sm text-slate-300 mb-2">Ativos Adicionados:</h4>}
                              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                  {customAssets.map(asset => (
                                      <li key={asset.id} className="flex justify-between items-start bg-slate-800/60 p-2 rounded-md text-sm">
                                          <div className="flex-grow">
                                              <div className="flex items-center gap-2 mb-1">
                                                  <p className="font-semibold text-white break-words">{asset.name}</p>
                                                  <span className="bg-slate-900 text-sky-200 text-xs font-medium px-2 py-0.5 rounded-full">{asset.riskType}</span>
                                              </div>
                                              <p className="text-xs text-slate-400">
                                                  {`Lat: ${asset.lat.toFixed(4)}, Lon: ${asset.lon.toFixed(4)}`}
                                              </p>
                                              {asset.altitude !== undefined && (
                                                  <p className="text-xs text-slate-400">
                                                      {`Altitude: ${asset.altitude} m`}
                                                  </p>
                                              )}
                                              <p className="text-xs text-slate-400">
                                                  Valor: {asset.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                              </p>
                                          </div>
                                          <button onClick={() => onRemoveAsset(asset.id)} className="text-red-400 hover:text-red-300 p-1 ml-2 flex-shrink-0">
                                              <TrashIcon />
                                          </button>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </Panel>
                  </div>
              </div>
          </main>
      </div>
    );
}
