import React from 'react';

interface HeaderProps {
    onMenuToggle: () => void;
}

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-emerald-900/80 backdrop-blur-sm text-white p-3 shadow-lg z-[1001] border-b border-emerald-700/50">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button
                onClick={onMenuToggle}
                className="text-emerald-300 hover:text-white transition-colors"
                aria-label="Open controls menu"
            >
                <MenuIcon />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Climatrix</h1>
              <p className="text-sm text-emerald-300">Precificação de Risco Climático</p>
            </div>
        </div>
      </div>
    </header>
  );
}