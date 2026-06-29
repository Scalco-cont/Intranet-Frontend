import { MessageSquarePlus } from 'lucide-react';

export function CommunicationCard() {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 text-primary">
        <MessageSquarePlus size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Comunicação Interna</h3>
      <p className="text-gray-500 max-w-sm mb-6">
        Um novo espaço para conectar todos os colaboradores está sendo preparado.
      </p>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
        <span>🚧</span>
        <span>Em breve</span>
      </div>
    </div>
  );
}
