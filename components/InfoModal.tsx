
import React from 'react';

interface InfoModalProps {
  show: boolean;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xl font-semibold text-sky-300 mb-3">{title}</h2>
        <div className="text-lg text-slate-300 space-y-2">{children}</div>
    </div>
);

export default function InfoModal({ show, onClose }: InfoModalProps) {
  if (!show) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8 font-sans">
      <div className="max-w-4xl text-center">
        <h1 className="text-6xl font-bold tracking-tight text-white mb-4">
          Climatrix
        </h1>
        <p className="text-2xl text-sky-300 mb-12">
          Precificação de Risco Climático
        </p>
        
        <div className="text-left bg-slate-800/50 border border-slate-700 rounded-xl p-8 sm:p-12 mb-12">
            <Section title="O que é o Climatrix?">
                <p>
                    Uma plataforma interativa para visualizar e precificar riscos climáticos. Usando trajetórias de furacões históricos e modelos de vulnerabilidade, demonstramos o potencial impacto financeiro de eventos climáticos extremos sobre ativos expostos.
                </p>
            </Section>
            <Section title="Como funciona:">
              <ol className="list-decimal list-inside space-y-2">
                <li>Simulamos o campo de vento de um furacão histórico usando o motor CLIMADA.</li>
                <li>Aplicamos curvas de vulnerabilidade aos ativos expostos no caminho do evento.</li>
                <li>Calculamos as perdas financeiras esperadas para cada localização, fornecendo uma visão clara do risco.</li>
              </ol>
            </Section>
        </div>

        <button
          onClick={onClose}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xl py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          Comece Já
        </button>
        <p className="mt-8 text-sm text-slate-500">
          <strong>Motor de Simulação:</strong> CLIMADA v6.0.1 (ETH Zürich)
        </p>
      </div>
    </div>
  );
}
