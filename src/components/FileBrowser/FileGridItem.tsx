import { FileText, Folder } from 'lucide-react';
import type { ItemArquivo } from '../../services/api';

interface FileGridItemProps {
  item: ItemArquivo;
  onAbrirPasta: () => void;
  onAbrirArquivo: () => void;
}

export function FileGridItem({ item, onAbrirPasta, onAbrirArquivo }: FileGridItemProps) {
  const ehPasta = item.tipo === 'pasta';
  const Icone = ehPasta ? Folder : FileText;

  return (
    <button
      onClick={ehPasta ? onAbrirPasta : onAbrirArquivo}
      className="group bg-white rounded-xl p-4 border border-gray-100 card-hover flex items-center gap-3 text-left"
    >
      <div className="bg-blue-50 text-primary p-2.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300 shrink-0">
        <Icone size={20} />
      </div>
      <span className="text-sm font-medium text-gray-900 truncate">{item.nome}</span>
    </button>
  );
}
