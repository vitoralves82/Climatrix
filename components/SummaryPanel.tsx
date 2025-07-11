import React from 'react';

interface SummaryPanelProps {
    stats: {
        points: number;
        totalValue: number;
        totalEai: number;
    };
    loading: boolean;
}

const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Panel: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
    <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700/50">
        <h3 className="text-base font-semibold text-slate-100 mb-3">{title}</h3>
        {children}
    </div>
);

const SkeletonLoader = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700 rounded w-4/6"></div>
    </div>
);

const SummaryRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}:</span>
        <span className="font-semibold text-slate-50">{value}</span>
    </div>
);


export default function SummaryPanel({ stats, loading }: SummaryPanelProps) {
    return (
        <Panel title="Resumo do Cenário">
            <div className="h-16">
                {loading ? <SkeletonLoader /> : (
                    <div className="space-y-2">
                        <SummaryRow label="Pontos analisados" value={stats.points} />
                        <SummaryRow label="Exposição total" value={formatCurrency(stats.totalValue)} />
                        <SummaryRow label="Perda total esperada" value={formatCurrency(stats.totalEai)} />
                    </div>
                )}
            </div>
        </Panel>
    );
}