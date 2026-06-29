import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { checkUrl } from '../../services/api';
import { MaintenanceModal } from '../MaintenanceModal/MaintenanceModal';

interface SystemCardProps {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  url: string;
}

export function SystemCard({ id, nome, descricao, icone, url }: SystemCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const [isChecking, setIsChecking] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  
  const systemId = `system-${id}`;
  const favorite = isFavorite(systemId);
  
  const IconComponent = (LucideIcons as any)[icone] || LucideIcons.AppWindow;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFavorite(systemId);
    } else {
      addFavorite(systemId);
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isChecking) return;
    
    const newTab = window.open('about:blank', '_blank');
    if (!newTab) {
      alert('Por favor, permita popups para abrir o sistema.');
      return;
    }
    
    setIsChecking(true);
    newTab.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Carregando...</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #1e3a8a;
          }
          .card {
            background: white;
            border-radius: 24px;
            padding: 56px 64px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(37,99,235,0.12);
            max-width: 420px;
            width: 90%;
            animation: fadeIn 0.4s ease;
          }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .spinner {
            width: 56px;
            height: 56px;
            border: 4px solid #dbeafe;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            animation: spin 0.9s linear infinite;
            margin: 0 auto 28px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          h2 { font-size: 20px; font-weight: 700; margin-bottom: 10px; color: #1e3a8a; }
          p  { font-size: 14px; color: #64748b; line-height: 1.6; }
          .badge {
            display: inline-block;
            margin-top: 20px;
            font-size: 12px;
            font-weight: 600;
            color: #2563eb;
            background: #eff6ff;
            padding: 6px 16px;
            border-radius: 999px;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h2>Verificando disponibilidade</h2>
          <p>Estamos conferindo se o sistema <strong>${nome}</strong> está acessível. Isso leva apenas um segundo.</p>
          <span class="badge">Intranet &bull; Acesso Seguro</span>
        </div>
      </body>
      </html>
    `);
    newTab.document.close();
    
    try {
      const res = await checkUrl(url);
      if (res.isUp) {
        newTab.location.href = url;
      } else {
        newTab.close();
        setShowMaintenance(true);
      }
    } catch {
      newTab.close();
      setShowMaintenance(true);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <a
        href={url}
        onClick={handleClick}
        className="group relative bg-white rounded-2xl p-6 border border-gray-100 card-hover flex flex-col h-full overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-in-out"></div>
        
        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-50 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <IconComponent size={24} />
          </div>
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              favorite ? 'text-yellow-400 bg-yellow-50' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-50'
            }`}
            title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <LucideIcons.Star size={20} className={favorite ? 'fill-current' : ''} />
          </button>
        </div>

        {favorite && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full mb-2 w-fit">
            <LucideIcons.Star size={9} className="fill-current" />
            Favorito
          </span>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          {nome}
          {isChecking && <LucideIcons.Loader2 size={16} className="animate-spin text-gray-400" />}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-auto">{descricao}</p>
        
        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span>Acessar</span>
          <LucideIcons.ArrowRight size={16} className="ml-1" />
        </div>
      </a>

      <MaintenanceModal 
        isOpen={showMaintenance} 
        onClose={() => setShowMaintenance(false)} 
        systemName={nome} 
      />
    </>
  );
}
