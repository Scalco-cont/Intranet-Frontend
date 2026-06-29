import { AlertTriangle, X } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemName: string;
}

export function MaintenanceModal({ isOpen, onClose, systemName }: MaintenanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Sistema Indisponível
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          O sistema <strong>{systemName}</strong> encontra-se em manutenção ou fora do ar no momento. Por favor, contate o administrador.
        </p>
        
        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
