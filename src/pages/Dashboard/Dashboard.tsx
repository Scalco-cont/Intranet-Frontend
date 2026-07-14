import { useEffect, useState, useMemo } from 'react';
import { SystemCard } from '../../components/SystemCard/SystemCard';
import { LinkCard } from '../../components/LinkCard/LinkCard';
import { CommunicationFeed } from '../../components/CommunicationFeed/CommunicationFeed';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { type Sistema, type LinkUtil, type Comunicado } from '../../services/api';
import { useFavoritesStore } from '../../store/useFavoritesStore';

interface DashboardProps {
  sistemas: Sistema[];
  links: LinkUtil[];
  comunicados: Comunicado[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onRefreshComunicados: () => void;
}

export function Dashboard({
  sistemas, links, comunicados, loading, error, onRetry, onRefreshComunicados
}: DashboardProps) {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { isFavorite } = useFavoritesStore();

  // Ordem base: admin define via ordem_exibicao (backend)
  // Favoritos do usuário sobem para o topo — apenas localmente (no PC dele)
  const sistemasSorted = useMemo(
    () =>
      [...sistemas].sort((a, b) => {
        const aFav = isFavorite(`system-${a.id}`) ? 0 : 1;
        const bFav = isFavorite(`system-${b.id}`) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return a.ordem_exibicao - b.ordem_exibicao;
      }),
    [sistemas, isFavorite]
  );

  const linksSorted = useMemo(
    () =>
      [...links].sort((a, b) => {
        const aFav = isFavorite(`link-${a.id}`) ? 0 : 1;
        const bFav = isFavorite(`link-${b.id}`) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return a.ordem_exibicao - b.ordem_exibicao;
      }),
    [links, isFavorite]
  );

  // Tags únicas disponíveis — extraídas diretamente dos dados da API (banco de dados)
  const allTags = useMemo(() => {
    const tags = links.flatMap((l) => l.tags ?? []);
    return [...new Set(tags)].sort();
  }, [links]);

  // Links filtrados por tag selecionada
  const linksFiltered = useMemo(() => {
    if (!activeTag) return linksSorted;
    return linksSorted.filter((l) => (l.tags ?? []).includes(activeTag));
  }, [linksSorted, activeTag]);

  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      setGreeting(h >= 5 && h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite');
      const d = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      setCurrentDate(`Hoje é ${d.charAt(0).toUpperCase() + d.slice(1)}`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      {/* Saudação */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{greeting}, colaborador! 👋</h1>
        <p className="text-sm text-gray-500">{currentDate}</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        /*
         * Layout de 3 colunas:
         *   Desktop:  Sistemas (40%) | Links (25%) | Comunicação (35%)
         *   Tablet:   Comunicação full | Sistemas + Links em 2 cols
         *   Mobile:   Tudo empilhado
         */
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Coluna 1: Sistemas (40%) ─────────────────────────── */}
          <section className="w-full lg:w-[40%] min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Sistemas Úteis</h2>
              <span className="text-xs text-gray-400">{sistemas.length} disponíveis</span>
            </div>
            {sistemasSorted.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum sistema cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {sistemasSorted.map((s) => <SystemCard key={s.id} {...s} />)}
              </div>
            )}
          </section>

          {/* ── Coluna 2: Links Úteis (25%) ──────────────────────── */}
          <section className="w-full lg:w-[25%] min-w-0 bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              Links Úteis
            </h2>

            {/* Filtro por etiquetas — visível a todos, tags vêm do banco */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                    activeTag === null
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700'
                  }`}
                >
                  Todas
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors capitalize ${
                      activeTag === tag
                        ? 'bg-accent text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-accent hover:text-accent'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {linksFiltered.length === 0 ? (
              <p className="text-sm text-gray-400">
                {activeTag
                  ? `Nenhum link com a etiqueta "${activeTag}".`
                  : 'Nenhum link cadastrado.'}
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {linksFiltered.map((l) => (
                  <LinkCard
                    key={l.id}
                    {...l}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Coluna 3: Comunicação Interna (35%) ──────────────── */}
          <section className="w-full lg:w-[35%] min-w-0 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <CommunicationFeed
              comunicados={comunicados}
              onRefresh={onRefreshComunicados}
            />
          </section>

        </div>
      )}
    </div>
  );
}
