import React from 'react';

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center mb-2">
        <span className={`w-5 h-5 rounded-full mr-3 ${color} border-2 border-black/20`}></span>
        <span className="text-sm text-slate-300">{label}</span>
    </div>
);

export default function LegendPanel() {
    return (
        <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700/50">
            <h3 className="text-base font-semibold text-slate-100 mb-3">Legenda</h3>
            <LegendItem color="bg-red-500" label="Área com perda esperada" />
            <LegendItem color="bg-orange-500" label="Área sem perda esperada" />
            <p className="text-xs text-slate-400 mt-2">
                Tamanho do círculo = magnitude do risco
            </p>
        </div>
    );
}