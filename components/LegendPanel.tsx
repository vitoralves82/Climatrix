import React from 'react';

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center mb-2">
        <span className={`w-5 h-5 rounded-full mr-3 ${color} border-2 border-white/50`}></span>
        <span className="text-sm text-gray-200">{label}</span>
    </div>
);

export default function LegendPanel() {
    return (
        <div className="bg-gray-800/70 backdrop-blur-md p-4 rounded-lg shadow-lg border border-gray-700/50 w-full max-w-xs sm:w-72">
            <h3 className="text-base font-semibold text-white mb-3">Legenda</h3>
            <LegendItem color="bg-red-500" label="Área com perda esperada" />
            <LegendItem color="bg-orange-500" label="Área sem perda esperada" />
            <p className="text-xs text-gray-400 mt-2">
                Tamanho do círculo = magnitude do risco
            </p>
        </div>
    );
}