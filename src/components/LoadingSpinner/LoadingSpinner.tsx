import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <Loader2 size={36} className="animate-spin text-primary" />
      <p className="text-sm">Carregando dados...</p>
    </div>
  );
}
