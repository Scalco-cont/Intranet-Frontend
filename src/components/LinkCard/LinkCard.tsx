import * as LucideIcons from 'lucide-react';
import { useState } from 'react';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { checkUrl } from '../../services/api';
import { MaintenanceModal } from '../MaintenanceModal/MaintenanceModal';

interface LinkCardProps {
  id: number;
  nome: string;
  descricao: string;
  url: string;
  icone: string;
  /** Tags opcionais gerenciadas pelo admin */
  tags?: string[];
}

// Paleta de cores para badges de tags
const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

function tagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function LinkCard({ id, nome, descricao, url, icone, tags }: LinkCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const [isChecking, setIsChecking] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  
  const linkId = `link-${id}`;
  const favorite = isFavorite(linkId);
  
  const IconComponent = (LucideIcons as any)[icone] || LucideIcons.Link;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isChecking) return;
    
    const newTab = window.open('about:blank', '_blank');
    if (!newTab) {
      alert('Por favor, permita popups para acessar o link.');
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
          <p>Estamos conferindo se o link <strong>${nome}</strong> está acessível. Isso leva apenas um segundo.</p>
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

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFavorite(linkId);
    } else {
      addFavorite(linkId);
    }
  };

  const hasTags = tags && tags.length > 0;

  return (
    <>
      <a
        href={url}
        onClick={handleClick}
        className="group bg-white rounded-xl p-4 border border-gray-100 card-hover flex items-start gap-4"
      >
        <div className="bg-accent/10 text-accent p-2.5 rounded-lg group-hover:bg-accent group-hover:text-white transition-colors duration-300 shrink-0 mt-0.5">
          <IconComponent size={20} />
        </div>
        
        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
            {nome}
            {isChecking && <LucideIcons.Loader2 size={12} className="animate-spin text-gray-400" />}
          </h4>
          <p className="text-xs text-gray-500 truncate">{descricao}</p>
          {hasTags && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tags!.map((tag) => (
                <span
                  key={tag}
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleFavorite}
          className={`p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 md:opacity-100 shrink-0 ${
            favorite ? 'text-yellow-400 bg-yellow-50 opacity-100' : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-50'
          }`}
          title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <LucideIcons.Star size={16} className={favorite ? 'fill-current' : ''} />
        </button>
      </a>

      <MaintenanceModal 
        isOpen={showMaintenance} 
        onClose={() => setShowMaintenance(false)} 
        systemName={nome} 
      />
    </>
  );
}
