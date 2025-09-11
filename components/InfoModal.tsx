import React from 'react';

interface InfoModalProps {
  show: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ModalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <>
        <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2">{title}</h3>
        {children}
    </>
);

export default function InfoModal({ show, onClose }: InfoModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000]">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-600 relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full p-1 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-4">Sobre este Modelo</h2>
        
        <ModalSection title="O que você está vendo:">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Dados reais:</strong> Trajetórias de furacões históricos do IBTrACS</li>
            <li><strong>Dados fictícios:</strong> Pontos de exposição com valores variados</li>
            <li><strong>Cálculo:</strong> Perda Anual Esperada (EAI) usando curvas de dano dos EUA</li>
          </ul>
        </ModalSection>

        <ModalSection title="Cenários disponíveis:">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Irma 2017:</strong> Devastou Caribe e Flórida</li>
            <li><strong>Matthew 2016:</strong> Impactou Haiti, Cuba e EUA</li>
            <li><strong>Maria 2017:</strong> Destruiu Porto Rico</li>
          </ul>
        </ModalSection>

        <ModalSection title="Como funciona:">
          <ol className="list-decimal list-inside space-y-1">
            <li>CLIMADA simula o campo de vento do furacão</li>
            <li>Aplica curvas de vulnerabilidade aos ativos expostos</li>
            <li>Calcula as perdas esperadas por localização</li>
          </ol>
        </ModalSection>

        <ModalSection title="Limitações atuais:">
          <ul className="list-disc list-inside space-y-1">
            <li>Exposição fictícia (não são ativos reais)</li>
            <li>Cenários pré-calculados (não dinâmicos)</li>
            <li>Curvas de dano genéricas dos EUA</li>
            <li>Sem ajuste para moeda ou inflação</li>
          </ul>
        </ModalSection>

        <ModalSection title="Próximas melhorias:">
          <ul className="list-disc list-inside space-y-1">
            <li>Cálculo em tempo real via API</li>
            <li>Upload de dados reais de exposição</li>
            <li>Mais tipos de hazards (enchentes, secas)</li>
            <li>Curvas de vulnerabilidade brasileiras</li>
          </ul>
        </ModalSection>

        <p className="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-500">
          <strong>Desenvolvido por:</strong> EnvironPact | 
          <strong> Engine:</strong> CLIMADA v6.0.1 (ETH Zürich)
        </p>
      </div>
    </div>
  );
}