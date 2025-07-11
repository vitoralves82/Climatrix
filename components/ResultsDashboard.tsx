

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, BarChart, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';
import type { Scenario } from '../types';
import ReportModal from './ReportModal';

interface ResultsDashboardProps {
  scenario: Scenario;
}

// --- MOCK DATA ---
const impactMetricsData = {
  lineChart: [
    { periodo: 1, perda: 178 }, { periodo: 2, perda: 155 }, { periodo: 5, perda: 120 }, { periodo: 10, perda: 95 },
    { periodo: 20, perda: 75 }, { periodo: 50, perda: 50 }, { periodo: 100, perda: 35 }, { periodo: 200, perda: 22 },
    { periodo: 500, perda: 12 }, { periodo: 1000, perda: 5 },
  ],
};

const damageDistributionData = {
  spatial: [
    { name: 'Região A', 'Perdas por Região': 42 }, { name: 'Região B', 'Perdas por Região': 68 },
    { name: 'Região C', 'Perdas por Região': 31 }, { name: 'Região D', 'Perdas por Região': 18 },
  ],
  byVesselType: [
    { name: 'FPSO', value: 45 }, { name: 'Plataformas', value: 35 }, { name: 'Embarcações de Apoio', value: 20 },
  ],
  byComponent: [
    { name: 'Estrutural', 'Custo (Milhões USD)': 48 }, { name: 'Equipamentos', 'Custo (Milhões USD)': 35 },
    { name: 'Interrupção de Operação', 'Custo (Milhões USD)': 72 }, { name: 'Evacuação', 'Custo (Milhões USD)': 12 },
    { name: 'Outros', 'Custo (Milhões USD)': 5 },
  ],
};
const vesselColors = ['#0ea5e9', '#38bdf8', '#7dd3fc']; // sky-500, sky-400, sky-300

const assetStatusData = [
    { id: 'FPSO-001', tipo: 'FPSO', valor: 380000000, lat: 25.4, lon: -74.8, intensidade: '210 km/h', dano: 68, status: 'Dano Severo' },
    { id: 'DRILL-002', tipo: 'Plataforma', valor: 250000000, lat: 24.9, lon: -75.2, intensidade: '180 km/h', dano: 42, status: 'Dano Moderado' },
    { id: 'SUP-003', tipo: 'Embarcação de Apoio', valor: 45000000, lat: 25.1, lon: -75.5, intensidade: '120 km/h', dano: 18, status: 'Dano Leve' },
    { id: 'FPSO-004', tipo: 'FPSO', valor: 420000000, lat: 24.7, lon: -74.3, intensidade: '90 km/h', dano: 5, status: 'Dano Mínimo' },
    { id: 'SUP-005', tipo: 'Embarcação de Apoio', valor: 55000000, lat: 25.8, lon: -76.1, intensidade: '110 km/h', dano: 15, status: 'Dano Leve' },
    { id: 'DRILL-006', tipo: 'Plataforma', valor: 310000000, lat: 24.5, lon: -75.9, intensidade: '150 km/h', dano: 30, status: 'Dano Moderado' },
];

// --- ICONS ---
const ExportCsvIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> );
const ExportJsonIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M10 18H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> );
const SearchIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );

// --- REUSABLE COMPONENTS ---
const StatCard: React.FC<{ title: string; value: string; description: string; valueColor?: string }> = ({ title, value, description, valueColor = 'text-white' }) => (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200"><h3 className="text-slate-400 font-semibold uppercase tracking-wide">{title}</h3><p className={`text-4xl font-bold mt-2 ${valueColor}`}>{value}</p><p className="text-sm text-slate-400 mt-2">{description}</p></div>
);
const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`py-3 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none ${ active ? 'border-b-2 border-sky-400 text-sky-400' : 'text-slate-400 hover:text-white hover:border-b-2 hover:border-slate-600' }`}>{label}</button>
);
const ChartContainer: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col ${className}`}><h3 className="text-xl font-bold text-slate-100 mb-4">{title}</h3><div className="flex-grow">{children}</div></div>
);
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Dano Severo': return 'bg-red-900/50 text-red-300 ring-1 ring-inset ring-red-400/30';
        case 'Dano Moderado': return 'bg-yellow-900/50 text-yellow-300 ring-1 ring-inset ring-yellow-400/30';
        case 'Dano Leve': return 'bg-lime-900/50 text-lime-300 ring-1 ring-inset ring-lime-400/30';
        case 'Dano Mínimo': return 'bg-green-900/50 text-green-300 ring-1 ring-inset ring-green-400/30';
        default: return 'bg-slate-700 text-slate-300 ring-1 ring-inset ring-slate-600';
    }
};
const StatusBadge: React.FC<{ status: string }> = ({ status }) => ( <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>{status}</span> );

// --- CHART PROPS ---
const commonChartProps = {
    grid: <CartesianGrid strokeDasharray="3 3" stroke="#334155" />, // slate-700
    xAxisTick: { fill: '#94a3b8' }, // slate-400
    yAxisTick: { fill: '#94a3b8' }, // slate-400
    axisLabelStyle: { fill: '#94a3b8' },
    tooltipStyle: { backgroundColor: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(4px)', border: '1px solid #475569', borderRadius: '0.5rem', color: '#FFF' }, // slate-800, slate-600
    legendFormatter: (value: string) => <span className="text-slate-300">{value}</span>,
};

// --- TAB COMPONENTS ---
const ImpactMetricsTab = () => (
    <>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Perda Anual Esperada (AAL)" value="$12.8 M" description="Valor esperado de perdas anuais" valueColor="text-sky-400"/>
            <StatCard title="Perda Máxima Provável (PML)" value="$145.2 M" description="Evento de 200 anos de retorno" valueColor="text-red-400"/>
            <StatCard title="Ativos Afetados" value="42%" description="Do valor total exposto" valueColor="text-slate-100"/>
        </section>
        <section className="mt-8 bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-1">Curva de Excedência de Probabilidade</h2>
            <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={impactMetricsData.lineChart} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                        {commonChartProps.grid}
                        <XAxis dataKey="periodo" type="number" scale="log" domain={[1, 1000]} ticks={[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]} name="Período de Retorno" label={{ value: 'Período de Retorno (anos)', position: 'insideBottom', offset: -15, style: commonChartProps.axisLabelStyle }} tick={commonChartProps.xAxisTick}/>
                        <YAxis dataKey="perda" name="Perdas" unit="M" label={{ value: 'Perda (Milhões USD)', angle: -90, position: 'insideLeft', offset: -10, style: commonChartProps.axisLabelStyle }} tickFormatter={(value) => `${value}`} tick={commonChartProps.yAxisTick}/>
                        <Tooltip formatter={(value, name) => [`$${value} M`, name]} labelFormatter={(label) => `Retorno: ${label} anos`} contentStyle={commonChartProps.tooltipStyle}/>
                        <Legend verticalAlign="top" height={36} formatter={commonChartProps.legendFormatter} />
                        <Line type="monotone" dataKey="perda" name="Perdas (Milhões USD)" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    </>
);

const DamageDistributionTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ChartContainer title="Distribuição Espacial de Danos" className="xl:col-span-3">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={damageDistributionData.spatial} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    {commonChartProps.grid}
                    <XAxis dataKey="name" tick={commonChartProps.xAxisTick} />
                    <YAxis label={{ value: 'Milhões USD', angle: -90, position: 'insideLeft', offset: 10, style: commonChartProps.axisLabelStyle }} tick={commonChartProps.yAxisTick}/>
                    <Tooltip cursor={{ fill: 'rgba(51, 65, 85, 0.5)' }} contentStyle={commonChartProps.tooltipStyle} />
                    <Legend verticalAlign="top" height={36} formatter={commonChartProps.legendFormatter}/>
                    <Bar dataKey="Perdas por Região" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Danos por Tipo de Embarcação" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={damageDistributionData.byVesselType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={false} labelLine={false}>
                        {damageDistributionData.byVesselType.map((entry, index) => (<Cell key={`cell-${index}`} fill={vesselColors[index % vesselColors.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} contentStyle={commonChartProps.tooltipStyle} />
                    <Legend formatter={commonChartProps.legendFormatter}/>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
        <div className="xl:col-span-5">
            <ChartContainer title="Componentes do Dano">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={damageDistributionData.byComponent} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                        {commonChartProps.grid}
                        <XAxis dataKey="name" tick={commonChartProps.xAxisTick} />
                        <YAxis label={{ value: 'Milhões USD', angle: -90, position: 'insideLeft', offset: -10, style: commonChartProps.axisLabelStyle }} tick={commonChartProps.yAxisTick} />
                        <Tooltip cursor={{ fill: 'rgba(51, 65, 85, 0.5)' }} contentStyle={commonChartProps.tooltipStyle} />
                        <Legend verticalAlign="top" height={36} formatter={commonChartProps.legendFormatter}/>
                        <Bar dataKey="Custo (Milhões USD)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    </div>
);

const AssetStatusTab = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredAssets = useMemo(() => {
        if (!searchTerm) return assetStatusData;
        const lowercasedTerm = searchTerm.toLowerCase();
        return assetStatusData.filter(asset =>
            asset.id.toLowerCase().includes(lowercasedTerm) ||
            asset.tipo.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm]);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
                <div className="relative">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Buscar por embarcação (ID ou Tipo)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder-slate-400"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/60">
                        <tr>
                            {['ID', 'Tipo', 'Valor (USD)', 'Latitude', 'Longitude', 'Intensidade', 'Dano (%)', 'Status'].map(h => 
                                <th key={h} scope="col" className="px-6 py-3">{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map(asset => (
                            <tr key={asset.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{asset.id}</td>
                                <td className="px-6 py-4">{asset.tipo}</td>
                                <td className="px-6 py-4">{asset.valor.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                <td className="px-6 py-4">{asset.lat}</td>
                                <td className="px-6 py-4">{asset.lon}</td>
                                <td className="px-6 py-4">{asset.intensidade}</td>
                                <td className="px-6 py-4">{asset.dano}%</td>
                                <td className="px-6 py-4"><StatusBadge status={asset.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAssets.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum ativo encontrado.</p>}
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function ResultsDashboard({ scenario }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState('Métricas');
  const [showReportModal, setShowReportModal] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Métricas': return <ImpactMetricsTab />;
      case 'Distribuição': return <DamageDistributionTab />;
      case 'Ativos': return <AssetStatusTab />;
      default: return <ImpactMetricsTab />;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 p-4 sm:p-6 md:p-8 h-full overflow-y-auto">
      <div>
        <header className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Resultados e Métricas</h1>
            <p className="text-md lg:text-lg text-sky-300 mt-1">{scenario.name}</p>
          </div>
        </header>

        <nav className="border-b border-slate-700">
          <TabButton label="Métricas" active={activeTab === 'Métricas'} onClick={() => setActiveTab('Métricas')} />
          <TabButton label="Distribuição" active={activeTab === 'Distribuição'} onClick={() => setActiveTab('Distribuição')} />
          <TabButton label="Ativos" active={activeTab === 'Ativos'} onClick={() => setActiveTab('Ativos')} />
        </nav>

        <main className="mt-8">
            {renderTabContent()}
            <footer className="mt-8 flex flex-wrap justify-between items-center gap-4">
                <button 
                    onClick={() => setShowReportModal(true)}
                    className="flex-grow sm:flex-grow-0 items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-colors duration-200"
                >
                    Gerar pré-relatório
                </button>
                <div className="flex justify-end gap-4 flex-grow sm:flex-grow-0">
                    <button className="flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"><ExportCsvIcon />CSV</button>
                    <button className="flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"><ExportJsonIcon />JSON</button>
                </div>
            </footer>
        </main>
      </div>

      <ReportModal 
          show={showReportModal} 
          onClose={() => setShowReportModal(false)}
          scenario={scenario}
          assetData={assetStatusData}
          damageDistribution={damageDistributionData}
      />
    </div>
  );
}
