import { useState } from 'react';
import { Pin, Pencil, Trash2, ChevronDown, ChevronUp, Send, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  reagir, getComentarios, createComentario, deleteComentario,
  fixarComunicado, deleteComunicado,
  type Comunicado, type Comentario,
} from '../../services/api';

const CATEGORIAS_CORES: Record<string, string> = {
  'Geral': 'bg-gray-100 text-gray-600',
  'RH': 'bg-purple-100 text-purple-700',
  'TI': 'bg-blue-100 text-blue-700',
  'Financeiro': 'bg-green-100 text-green-700',
  'Diretoria': 'bg-amber-100 text-amber-700',
  'Aviso Importante': 'bg-red-100 text-red-700',
};

const EMOJIS = ['👍', '❤️', '🎉', '👏', '🚀', '💡'];

interface ComunicadoCardProps {
  comunicado: Comunicado;
  onRefresh: () => void;
  onEdit?: (comunicado: Comunicado) => void;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function ComunicadoCard({ comunicado, onRefresh, onEdit }: ComunicadoCardProps) {
  const { token, isAdmin, isEditor } = useAuthStore();
  const [reacoes, setReacoes] = useState<Record<string, number>>(comunicado.reacoes);
  const [showComments, setShowComments] = useState(false);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [autorNome, setAutorNome] = useState('');
  const [texto, setTexto] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Cliente ID para controle de reações
  const getClienteId = () => {
    let id = localStorage.getItem('intranet_cliente_id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem('intranet_cliente_id', id);
    }
    return id;
  };

  const categoriaClass = CATEGORIAS_CORES[comunicado.categoria] ?? 'bg-gray-100 text-gray-600';
  const canManage = isAdmin || isEditor;

  const handleReacao = async (emoji: string) => {
    try {
      const res = await reagir(comunicado.id, emoji, getClienteId());
      setReacoes(res.reacoes);
    } catch { /* silencioso */ }
  };

  const toggleComments = async () => {
    if (!showComments && comentarios.length === 0) {
      setLoadingComments(true);
      try {
        const data = await getComentarios(comunicado.id);
        setComentarios(data);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments((v) => !v);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setSendingComment(true);
    try {
      const novo = await createComentario(comunicado.id, {
        autor_nome: autorNome.trim() || 'Anônimo',
        comentario: texto.trim(),
      });
      setComentarios((prev) => [...prev, novo]);
      setTexto('');
      onRefresh();
    } finally {
      setSendingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !confirm('Excluir este comunicado?')) return;
    await deleteComunicado(comunicado.id, token);
    onRefresh();
  };

  const handleDeleteComentario = async (comentarioId: number) => {
    if (!token || !confirm('Excluir este comentário?')) return;
    await deleteComentario(comunicado.id, comentarioId, token);
    setComentarios((prev) => prev.filter(c => c.id !== comentarioId));
    onRefresh();
  };

  const handleFixar = async () => {
    if (!token) return;
    await fixarComunicado(comunicado.id, token);
    onRefresh();
  };

  const styleConfig = {
    normal: {
      border: 'border-gray-100',
      bg: 'bg-white',
      title: 'text-gray-900',
      text: 'text-gray-600',
    }
  }['normal']; // Always normal styling for the card container

  return (
    <article className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${styleConfig.border} ${styleConfig.bg}`}>
      {/* Pinned banner */}
      {comunicado.fixado && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 border-b border-blue-100 text-blue-600 text-xs font-semibold">
          <Pin size={12} className="fill-current" />
          Fixado no topo
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white bg-gradient-to-br from-primary to-blue-400">
              {getInitials(comunicado.autor)}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold truncate ${styleConfig.title}`}>{comunicado.autor}</p>
              <p className={`text-[11px] text-gray-400 opacity-75`}>
                {formatDate(comunicado.criado_em)}
              </p>
            </div>
          </div>

          {/* Categoria + Ações */}
          <div className="flex items-center gap-2 shrink-0">
            {comunicado.prioridade === 'importante' && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-red-600 text-white shadow-sm ring-1 ring-red-600/50 animate-pulse">
                <AlertCircle size={12} />
                Muito Importante
              </span>
            )}
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${categoriaClass}`}>
              {comunicado.categoria}
            </span>
            {canManage && (
              <div className="flex items-center gap-1">
                <button onClick={handleFixar} title={comunicado.fixado ? 'Desafixar' : 'Fixar'}
                  className={`p-1.5 rounded-lg transition-colors ${comunicado.fixado ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                  <Pin size={14} />
                </button>
                <button onClick={() => onEdit?.(comunicado)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <h3 className={`font-bold mb-1.5 leading-snug ${styleConfig.title}`}>{comunicado.titulo}</h3>
        <div 
          className={`text-sm leading-relaxed prose prose-sm max-w-none ${styleConfig.text}`}
          dangerouslySetInnerHTML={{ __html: comunicado.conteudo }}
        />

        {/* Reações */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReacao(emoji)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm"
            >
              <span>{emoji}</span>
              {reacoes[emoji] ? <span className="text-xs font-semibold text-gray-600">{reacoes[emoji]}</span> : null}
            </button>
          ))}
        </div>

        {/* Toggle comentários */}
        <button
          onClick={toggleComments}
          className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {comunicado.total_comentarios > 0
            ? `${comunicado.total_comentarios} comentário${comunicado.total_comentarios > 1 ? 's' : ''}`
            : 'Comentar'}
        </button>
      </div>

      {/* Comentários */}
      {showComments && (
        <div className={`border-t border-gray-100 px-5 py-4 space-y-3 ${comunicado.prioridade === 'normal' ? 'bg-gray-50' : ''}`}>
          {loadingComments ? (
            <p className="text-xs text-gray-400">Carregando...</p>
          ) : comentarios.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            comentarios.map((c) => (
              <div key={c.id} className="flex gap-2.5 group">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {getInitials(c.autor_nome)}
                </div>
                <div className="bg-white rounded-xl px-3 py-2 flex-1 border border-gray-100 relative">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-700">{c.autor_nome}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{c.comentario}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(c.criado_em)}</p>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteComentario(c.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Excluir Comentário"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Form de comentário */}
          <form onSubmit={handleComment} className="flex flex-col gap-2 pt-1">
            <input
              type="text"
              placeholder="Seu nome (opcional)"
              value={autorNome}
              onChange={(e) => setAutorNome(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white/50"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                required
                className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white/50"
              />
              <button
                type="submit"
                disabled={sendingComment || !texto.trim()}
                className="p-2 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
