

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

const MainViewTab: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-lg font-bold transition-colors duration-200 ${
            isActive
                ? 'text-white bg-slate-700'
                : 'text-sky-300 bg-slate-900 hover:bg-slate-800'
        }`}
    >
        {label}
    </button>
);


export default function App() {
  const [view, setView] = useState<'welcome' | 'controls' | 'main'>('welcome');
  const [mainViewTab, setMainViewTab] = useState<'map' | 'results'>('map');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(scenarios[0]);
  const [loading, setLoading] = useState<boolean>(true);
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

  const handleStart = () => setView('controls');
  const handleNavigateToMap = () => {
    setView('main');
    setMainViewTab('map');
  };
  const handleNavigateToResults = () => {
    setView('main');
    setMainViewTab('results');
  };
  const handleBackToControls = () => setView('controls');

  // View 1: Welcome Screen
  if (view === 'welcome') {
      return <InfoModal show={true} onClose={handleStart} />;
  }

  // View 2: Controls Fullscreen View
  if (view === 'controls') {
      return (
          <ControlsMenu
              onNavigateToMap={handleNavigateToMap}
              onNavigateToResults={handleNavigateToResults}
              scenarios={scenarios}
              selectedScenarioId={selectedScenarioId}
              onScenarioChange={setSelectedScenarioId}
              loading={loading}
              description={currentScenario.description}
              customAssets={customAssets}
              onAddAsset={handleAddAsset}
              onRemoveAsset={handleRemoveAsset}
          />
      );
  }

  // View 3: Main App (Tabbed Map + Results)
  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col font-sans">
      <Header onMenuToggle={handleBackToControls} />
      
      <div className="flex-grow flex flex-col">
          {/* Tab Navigation */}
          <div className="flex-shrink-0 bg-slate-900 flex">
              <MainViewTab label="Mapa" isActive={mainViewTab === 'map'} onClick={() => setMainViewTab('map')} />
              <MainViewTab label="Resultados" isActive={mainViewTab === 'results'} onClick={() => setMainViewTab('results')} />
          </div>

          {/* Tab Content */}
          <div className="flex-grow relative bg-slate-950">
              {mainViewTab === 'map' && (
                  <div className="h-full w-full">
                      <MapWrapper scenario={currentScenario} customAssets={customAssets} />
                      <div className="absolute top-4 left-4 z-[500] w-full max-w-xs sm:w-72">
                          <SummaryPanel stats={summaryStats} loading={loading} />
                      </div>
                      <div className="absolute bottom-4 right-4 z-[500] w-full max-w-xs sm:w-72">
                          <LegendPanel />
                      </div>
                  </div>
              )}
              {mainViewTab === 'results' && (
                  <div className="h-full w-full">
                    <ResultsDashboard scenario={currentScenario} />
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}