import { ServerCrash, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="bg-red-50 text-red-500 p-4 rounded-2xl">
        <ServerCrash size={36} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Erro ao carregar dados</h3>
        <p className="text-sm text-gray-500 max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <RefreshCw size={16} />
        Tentar novamente
      </button>
    </div>
  );
}
