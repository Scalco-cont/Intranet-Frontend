import { Folder } from 'lucide-react';
import type { CrumbArquivo } from '../../services/api';

interface BreadcrumbProps {
  caminho: CrumbArquivo[];
  onNavegar: (token: string | null) => void;
}

export function Breadcrumb({ caminho, onNavegar }: BreadcrumbProps) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-500 mb-4">
      <Folder size={14} className="text-gray-400" />
      {caminho.map((crumb, indice) => {
        const ultimo = indice === caminho.length - 1;
        return (
          <span key={crumb.token ?? 'raiz'} className="flex items-center gap-1">
            {indice > 0 && <span className="text-gray-300">/</span>}
            <button
              onClick={() => onNavegar(crumb.token)}
              disabled={ultimo}
              className={ultimo ? 'font-semibold text-gray-800' : 'hover:text-primary hover:underline'}
            >
              {crumb.nome}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
