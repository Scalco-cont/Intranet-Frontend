import { useState } from 'react';
import { Plus, X, AlertCircle, Megaphone, CheckSquare, Square } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAuthStore } from '../../store/useAuthStore';
import { ComunicadoCard } from '../ComunicadoCard/ComunicadoCard';
import {
  createComunicado, updateComunicado,
  type Comunicado,
} from '../../services/api';

const CATEGORIAS = ['Geral', 'RH', 'TI', 'Financeiro', 'Diretoria', 'Aviso Importante'];

interface CommunicationFeedProps {
  comunicados: Comunicado[];
  onRefresh: () => void;
}

interface FormData {
  titulo: string;
  conteudo: string;
  categoria: string;
  prioridade: 'normal' | 'importante' | 'urgente';
}

const EMPTY_FORM: FormData = { titulo: '', conteudo: '', categoria: 'Geral', prioridade: 'normal' };

export function CommunicationFeed({ comunicados, onRefresh }: CommunicationFeedProps) {
  const { token, isAdmin, isEditor } = useAuthStore();
  const canPost = isAdmin || isEditor;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (c: Comunicado) => {
    setForm({ titulo: c.titulo, conteudo: c.conteudo, categoria: c.categoria, prioridade: c.prioridade });
    setEditingId(c.id);
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateComunicado(editingId, form, token);
      } else {
        await createComunicado(form, token);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header da seção */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
            <Megaphone size={16} />
          </div>
          <h2 className="text-base font-bold text-gray-900">Comunicação Interna</h2>
        </div>
        {canPost && !showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Publicar
          </button>
        )}
      </div>

      {/* Formulário de novo comunicado */}
      {showForm && canPost && (
        <form
          onSubmit={handleSubmit}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4 space-y-3"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-primary">
              {editingId ? 'Editar comunicado' : 'Novo comunicado'}
            </p>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Título do comunicado"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-primary/30">
            <ReactQuill
              theme="snow"
              value={form.conteudo}
              onChange={(val) => setForm({ ...form, conteudo: val })}
              placeholder="Escreva o conteúdo (negrito, itálico, cores...)"
              className="h-40 mb-10"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['link'],
                  ['clean']
                ]
              }}
            />
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setForm({ ...form, prioridade: form.prioridade === 'importante' ? 'normal' : 'importante' })}
              className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 border rounded-xl text-sm font-semibold transition-colors ${
                form.prioridade === 'importante' 
                ? 'bg-red-50 border-red-200 text-red-600' 
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {form.prioridade === 'importante' ? <CheckSquare size={18} /> : <Square size={18} />}
              Muito Importante
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Publicando...' : editingId ? 'Salvar alterações' : 'Publicar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 text-sm text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Feed com scroll próprio */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: '70vh' }}>
        {comunicados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <Megaphone size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum comunicado ainda.</p>
            {canPost && (
              <p className="text-xs mt-1">Clique em "Publicar" para criar o primeiro.</p>
            )}
          </div>
        ) : (
          comunicados.map((c) => (
            <ComunicadoCard
              key={c.id}
              comunicado={c}
              onRefresh={onRefresh}
              onEdit={canPost ? openEdit : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
