
import React from 'react';

interface HeaderProps {
    onMenuToggle: () => void;
}

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);


export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm text-white p-3 shadow-lg z-[1001] border-b border-slate-700/50">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button
                onClick={onMenuToggle}
                className="text-sky-300 hover:text-white transition-colors flex items-center text-sm font-semibold bg-slate-800/50 hover:bg-slate-700/50 py-2 px-4 rounded-lg"
                aria-label="Voltar para Controles"
            >
                <BackArrowIcon />
                Controles
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Climatrix</h1>
              <p className="text-sm text-slate-300">Precificação de Risco Climático</p>
            </div>
        </div>
      </div>
    </header>
  );
}
