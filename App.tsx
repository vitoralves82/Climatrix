import React, { useState, useEffect, useMemo } from 'react';
import { scenarios } from './constants';
import type { Scenario } from './types';
import Header from './components/Header';
import MapWrapper from './components/MapWrapper';
import InfoModal from './components/InfoModal';
import SummaryPanel from './components/SummaryPanel';
import LegendPanel from './components/LegendPanel';
import ControlsMenu from './components/ControlsMenu';
import { ResultsDashboard } from './components/ResultsDashboard';

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const MaximizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
);

const MinimizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
    </svg>
);


export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(scenarios[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isControlsMenuOpen, setControlsMenuOpen] = useState(false);
  const [isMapMaximized, setMapMaximized] = useState(false);

  useEffect(() => {
    setLoading(true);
    const newScenario = scenarios.find(s => s.id === selectedScenarioId);
    if (newScenario) {
        setTimeout(() => {
            setCurrentScenario(newScenario);
            setLoading(false);
        }, 500);
    }
  }, [selectedScenarioId]);

  const summaryStats = useMemo(() => {
    if (!currentScenario.data || currentScenario.data.features.length === 0) {
      return { points: 0, totalValue: 0, totalEai: 0 };
    }
    const points = currentScenario.data.features.length;
    const totalValue = currentScenario.data.features.reduce((sum, f) => sum + f.properties.value, 0);
    const totalEai = currentScenario.data.features.reduce((sum, f) => sum + f.properties.eai, 0);
    return { points, totalValue, totalEai };
  }, [currentScenario]);


  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans">
      <Header onMenuToggle={() => setControlsMenuOpen(true)} />
      
      <ControlsMenu 
          isOpen={isControlsMenuOpen} 
          onClose={() => setControlsMenuOpen(false)}
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
          onScenarioChange={setSelectedScenarioId}
          loading={loading}
          description={currentScenario.description}
      />

      {/* Main Dashboard Area */}
      <main className={`flex-grow p-4 lg:p-6 bg-gray-800 transition-all duration-300 ${isMapMaximized ? 'p-0' : ''}`}>
        <div className={`
          ${isMapMaximized 
            ? 'fixed inset-0 z-[1100] bg-gray-800 flex flex-col' 
            : 'relative bg-gray-900/50 rounded-xl shadow-2xl border border-gray-700 h-full flex flex-col'
          }
        `}>
          {/* Widget Header */}
          <div className={`flex justify-between items-center p-4 ${isMapMaximized ? 'bg-gray-800' : 'bg-transparent'}`}>
            <h2 className="text-xl font-bold text-white">Visualização do Mapa</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowInfo(true)}
                className="hidden sm:flex items-center bg-sky-600/50 hover:bg-sky-600/80 text-white font-semibold py-2 px-3 rounded-lg shadow-lg transition-colors duration-200 text-sm"
              >
                <InfoIcon />
                Sobre
              </button>
              <button 
                onClick={() => setMapMaximized(!isMapMaximized)}
                className="text-gray-300 hover:text-white transition-colors"
                title={isMapMaximized ? 'Restaurar' : 'Maximizar'}
              >
                {isMapMaximized ? <MinimizeIcon /> : <MaximizeIcon />}
              </button>
            </div>
          </div>
          
          {/* Widget Body */}
          <div className="flex-grow relative rounded-b-xl overflow-hidden">
            <MapWrapper scenario={currentScenario} />
            
            <div className="absolute top-0 right-0 z-[1000] p-4 flex flex-col items-end gap-4">
              <SummaryPanel stats={summaryStats} loading={loading} />
              <div className="bg-gray-800/70 backdrop-blur-md p-4 rounded-lg shadow-lg border border-gray-700/50 w-full max-w-xs sm:w-72">
                  <h3 className="text-base font-semibold text-white mb-3">Resultados Detalhados</h3>
                  <p className="text-sm text-gray-300 mb-4">Analise as métricas de impacto e a distribuição de danos do cenário.</p>
                  <button 
                      onClick={() => setShowResults(true)}
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                  >
                      Ver Dashboard de Resultados
                  </button>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 z-[1000] p-4">
                <LegendPanel />
            </div>
          </div>
        </div>
      </main>

      <InfoModal show={showInfo} onClose={() => setShowInfo(false)} />
      {showInfo && <div className="fixed inset-0 bg-black/50 z-[1999]" onClick={() => setShowInfo(false)}></div>}
      
      <ResultsDashboard 
        show={showResults} 
        onClose={() => setShowResults(false)}
        scenario={currentScenario}
      />
    </div>
  );
}