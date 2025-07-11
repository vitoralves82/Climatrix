
import React from 'react';
import { ResponsiveContainer, BarChart, PieChart, Pie, Cell, Legend, Bar, Tooltip, XAxis, YAxis } from 'recharts';
import type { Scenario } from '../types';

// --- TYPE DEFINITIONS ---
interface Asset {
    id: string;
    tipo: string;
    valor: number;
    lat: number;
    lon: number;
    intensidade: string;
    dano: number;
    status: string;
}

interface DamageDistribution {
    byVesselType: { name: string, value: number }[];
    byComponent: { name:string, 'Custo (Milhões USD)': number }[];
}

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
  scenario: Scenario;
  assetData: Asset[];
  damageDistribution: DamageDistribution;
}

// --- ICONS ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
);

// --- HELPER COMPONENTS ---
const StatCard: React.FC<{ title: string; value: string; description: string; valueColor?: string }> = ({ title, value, description, valueColor = 'text-white' }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg"><h3 className="text-sm text-gray-400 font-semibold uppercase tracking-wide">{title}</h3><p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p><p className="text-xs text-gray-400 mt-1">{description}</p></div>
);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Dano Severo': return 'bg-red-900/50 text-red-300 ring-1 ring-inset ring-red-400/30';
        case 'Dano Moderado': return 'bg-yellow-900/50 text-yellow-300 ring-1 ring-inset ring-yellow-400/30';
        case 'Dano Leve': return 'bg-lime-900/50 text-lime-300 ring-1 ring-inset ring-lime-400/30';
        case 'Dano Mínimo': return 'bg-green-900/50 text-green-300 ring-1 ring-inset ring-green-400/30';
        default: return 'bg-gray-700 text-gray-300 ring-1 ring-inset ring-gray-600';
    }
};
const StatusBadge: React.FC<{ status: string }> = ({ status }) => ( <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(status)}`}>{status}</span> );
const ChartContainer: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-gray-900/50 p-4 rounded-lg flex flex-col ${className}`}><h3 className="text-lg font-bold text-slate-100 mb-4">{title}</h3><div className="flex-grow">{children}</div></div>
);

const vesselColors = ['#60a5fa', '#4ade80', '#fb923c'];

// --- MAIN COMPONENT ---
export default function ReportModal({ show, onClose, scenario, assetData, damageDistribution }: ReportModalProps) {
    if (!show) return null;

    const tooltipStyle = { backgroundColor: 'rgba(31, 41, 55, 0.9)', backdropFilter: 'blur(4px)', border: '1px solid #4A5568', borderRadius: '0.5rem', color: '#FFF' };
    const legendFormatter = (value: string) => <span className="text-slate-300">{value}</span>;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-[1999] no-print" onClick={onClose} aria-hidden="true"></div>
            <div className="fixed inset-0 flex items-center justify-center z-[2000] p-4 print:p-0 printable-report-container" aria-labelledby="report-title" role="dialog" aria-modal="true">
                <style>
                {`
                    @media print {
                        body > *:not(.printable-report-container) {
                            display: none;
                        }
                        .printable-report-container {
                            position: static;
                            display: block !important;
                        }
                        .printable-report {
                            width: 100%;
                            max-width: 100%;
                            height: auto;
                            max-height: none;
                            box-shadow: none;
                            border: none;
                            color: black !important;
                            overflow: visible;
                            transform: none !important;
                            opacity: 1 !important;
                            animation: none !important;
                            display: block;
                        }
                        .printable-report .bg-gray-800 { background: white !important; }
                        .printable-report .bg-gray-900\\/50 { background: #f9fafb !important; border: 1px solid #e5e7eb; }
                        .printable-report .bg-gray-700\\/50 { background: #f3f4f6 !important; }
                        .printable-report .text-white, .printable-report .text-slate-100, .printable-report .text-slate-300 { color: #1f2937 !important; }
                        .printable-report .text-gray-400, .printable-report .text-sky-300 { color: #4b5563 !important; }
                        .printable-report .text-sky-400 { color: #0ea5e9 !important; }
                        .printable-report .text-red-400 { color: #ef4444 !important; }
                        .printable-report .text-red-300, .printable-report .text-yellow-300, .printable-report .text-lime-300, .printable-report .text-green-300 { color: #1f2937 !important; }
                        .printable-report .bg-red-900\\/50, .printable-report .bg-yellow-900\\/50, .printable-report .bg-lime-900\\/50, .printable-report .bg-green-900\\/50 { background: #f3f4f6 !important; }
                        .printable-report .no-print { display: none; }
                        .printable-report .border-gray-700 { border-color: #e5e7eb !important; }
                        .printable-report .recharts-surface, .printable-report .recharts-wrapper, .printable-report .recharts-legend-wrapper { filter: grayscale(1); }
                        .printable-report table thead { background: #f3f4f6 !important; }
                        .printable-report table tbody tr { border-color: #e5e7eb !important; }
                        .printable-report table tr:nth-child(even) { background-color: #f9fafb !important; }
                        .printable-report .ring-1 { ring-width: 0px !important; }
                    }
                `}
                </style>
                <div className="bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col text-slate-200 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale printable-report">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0 no-print">
                        <h2 id="report-title" className="text-xl font-bold text-white">Pré-Relatório de Análise de Risco</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => window.print()} className="flex items-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm">
                                <PrintIcon /> Imprimir
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-colors" aria-label="Close modal">
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto">
                        <header className="mb-6">
                            <h1 className="text-3xl font-bold text-white">{scenario.name}</h1>
                            <p className="text-lg text-sky-300">{scenario.description}</p>
                        </header>
                        
                        <section className="mb-6">
                            <h2 className="text-xl font-bold text-slate-100 mb-3">Resumo das Métricas de Impacto</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard title="Perda Anual Esperada (AAL)" value="$12.8 M" description="Valor esperado de perdas anuais" valueColor="text-sky-400"/>
                                <StatCard title="Perda Máxima Provável (PML)" value="$145.2 M" description="Evento de 200 anos de retorno" valueColor="text-red-400"/>
                                <StatCard title="Ativos Afetados" value="42%" description="Do valor total exposto" valueColor="text-slate-100"/>
                            </div>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-bold text-slate-100 mb-3">Detalhes de Dano por Ativo</h2>
                            <div className="overflow-x-auto rounded-lg border border-gray-700">
                                <table className="w-full text-sm text-left text-slate-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/60">
                                        <tr>
                                            {['ID', 'Tipo', 'Valor (USD)', 'Intensidade', 'Dano (%)', 'Status'].map(h => 
                                                <th key={h} scope="col" className="px-4 py-3">{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assetData.map(asset => (
                                            <tr key={asset.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                                                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{asset.id}</td>
                                                <td className="px-4 py-3">{asset.tipo}</td>
                                                <td className="px-4 py-3">{asset.valor.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                                <td className="px-4 py-3">{asset.intensidade}</td>
                                                <td className="px-4 py-3">{asset.dano}%</td>
                                                <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-bold text-slate-100 mb-3">Distribuição de Danos</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ChartContainer title="Danos por Tipo de Embarcação">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={damageDistribution.byVesselType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={false} labelLine={false}>
                                                {damageDistribution.byVesselType.map((entry, index) => (<Cell key={`cell-${index}`} fill={vesselColors[index % vesselColors.length]} />))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
                                            <Legend formatter={legendFormatter} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                                <ChartContainer title="Componentes do Dano">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={damageDistribution.byComponent} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                                            <XAxis type="number" hide tick={{ fill: '#a0aec0' }} />
                                            <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#a0aec0', fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: 'rgba(55, 65, 81, 0.5)' }} contentStyle={tooltipStyle} formatter={(value) => [`$${value} M`, 'Custo']}/>
                                            <Bar dataKey="Custo (Milhões USD)" fill="#84cc16" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </section>

                        <footer className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-500">
                            <p><strong>Aviso:</strong> Este é um pré-relatório gerado com dados de simulação. As perdas são estimativas e não devem ser usadas para fins de decisão final sem uma análise aprofundada. Desenvolvido por EnvironPact.</p>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}