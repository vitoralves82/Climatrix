import React, { useState, useEffect, useMemo } from 'react';
import { scenarios } from './constants';
import type { Scenario, CustomAsset } from './types';
import Header from './components/Header';
import MapWrapper from './components/MapWrapper';
import InfoModal from './components/InfoModal';
import SummaryPanel from './components/SummaryPanel';
import LegendPanel from './components/LegendPanel';
import ControlsMenu from './components/ControlsMenu';
import ResultsDashboard from './components/ResultsDashboard';

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
  const [isControlsMenuOpen, setControlsMenuOpen] = useState(false);
  const [isMapMaximized, setMapMaximized] = useState(false);
  const [customAssets, setCustomAssets] = useState<CustomAsset[]>([]);

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

  const handleAddAsset = (asset: CustomAsset) => {
    setCustomAssets(prevAssets => [...prevAssets, asset]);
  };

  const handleRemoveAsset = (id: number) => {
    setCustomAssets(prevAssets => prevAssets.filter(asset => asset.id !== id));
  };


  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans overflow-hidden">
      <Header onMenuToggle={() => setControlsMenuOpen(true)} />
      
      <ControlsMenu 
          isOpen={isControlsMenuOpen} 
          onClose={() => setControlsMenuOpen(false)}
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
          onScenarioChange={setSelectedScenarioId}
          loading={loading}
          description={currentScenario.description}
          customAssets={customAssets}
          onAddAsset={handleAddAsset}
          onRemoveAsset={handleRemoveAsset}
      />

      {/* Main Content: Map + Results */}
      <div className="flex-grow flex flex-row overflow-hidden">
          
          {/* Left Column (Map + Info Bar) */}
          <main className={`flex-grow flex flex-col transition-all duration-300 ${isMapMaximized ? 'w-full' : 'w-3/5'}`}>
              
              {/* Map Widget Wrapper */}
              <div className="flex-grow flex flex-col relative bg-gray-200">
                  {/* Widget Header */}
                  <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0 text-gray-800 z-[501]">
                      <h2 className="text-xl font-bold">Visualização do Mapa</h2>
                      <div className="flex items-center gap-4">
                          <button
                              onClick={() => setShowInfo(true)}
                              className="hidden sm:flex items-center bg-sky-600/10 hover:bg-sky-600/20 text-sky-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                          >
                              <InfoIcon /> Sobre
                          </button>
                          <button 
                              onClick={() => setMapMaximized(!isMapMaximized)}
                              className="text-gray-500 hover:text-gray-900 transition-colors"
                              title={isMapMaximized ? 'Restaurar' : 'Maximizar'}
                          >
                              {isMapMaximized ? <MinimizeIcon /> : <MaximizeIcon />}
                          </button>
                      </div>
                  </div>
                  
                  {/* Map Body */}
                  <div className="flex-grow relative">
                      <MapWrapper scenario={currentScenario} customAssets={customAssets} />
                      {!isMapMaximized && (
                        <>
                            <div className="absolute top-4 left-4 z-[500] w-full max-w-xs sm:w-72">
                                <SummaryPanel stats={summaryStats} loading={loading} />
                            </div>
                            <div className="absolute bottom-4 right-4 z-[500] w-full max-w-xs sm:w-72">
                                <LegendPanel />
                            </div>
                        </>
                      )}
                  </div>
              </div>
          </main>

          {/* Right Sidebar (Results Dashboard) */}
          <aside className={`flex-shrink-0 bg-gray-900 border-l border-gray-700 overflow-y-auto transition-all duration-300 ${isMapMaximized ? 'w-0' : 'w-2/5'}`}>
             { !isMapMaximized && <ResultsDashboard scenario={currentScenario} /> }
          </aside>
      </div>

      <InfoModal show={showInfo} onClose={() => setShowInfo(false)} />
      {showInfo && <div className="fixed inset-0 bg-black/50 z-[1999]" onClick={() => setShowInfo(false)}></div>}
      
    </div>
  );
}