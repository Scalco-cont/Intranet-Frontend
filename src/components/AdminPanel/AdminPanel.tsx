import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Save, AlertCircle, ChevronUp, ChevronDown, Tag } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLinksTagsStore } from '../../store/useLinksTagsStore';
import {
  getSistemas, getLinks,
  createSistema, updateSistema, deleteSistema, reorderSistemas,
  createLink, updateLink, deleteLink, reorderLinks,
  getUsuarios, updateUsuario, type Sistema, type LinkUtil, type Usuario,
} from '../../services/api';

type Tab = 'sistemas' | 'links' | 'usuarios';

interface AdminPanelProps {
  onClose: () => void;
  onRefresh: () => void;
}

const EMPTY_SISTEMA = { nome: '', descricao: '', icone: 'AppWindow', url: '' };
const EMPTY_LINK = { nome: '', descricao: '', icone: 'Link', url: '' };

export function AdminPanel({ onClose, onRefresh }: AdminPanelProps) {
  const { token, usuario, logout } = useAuthStore();
  const { getTagsForLink, setTagsForLink } = useLinksTagsStore();

  const [activeTab, setActiveTab] = useState<Tab>('sistemas');
  const [items, setItems] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setOrderChanged(false);
    try {
      if (activeTab === 'sistemas') {
        const data = await getSistemas();
        setItems(data);
      } else if (activeTab === 'links') {
        const data = await getLinks();
        setItems(data);
      } else if (activeTab === 'usuarios') {
        const data = await getUsuarios(token!);
        setUsuarios(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  };

  const isEditingSistema = activeTab === 'sistemas';

  const openNew = () => {
    setFormData(isEditingSistema ? { ...EMPTY_SISTEMA } : { ...EMPTY_LINK });
    setFormTags([]);
    setTagInput('');
    setEditingId('new');
    setError(null);
  };

  const openEdit = (item: Sistema | LinkUtil) => {
    setFormData({
      nome: item.nome,
      descricao: item.descricao,
      icone: item.icone,
      url: item.url,
    });
    // Carrega as tags atuais do link (somente para links)
    if (!isEditingSistema) {
      setFormTags(getTagsForLink(item.id));
    } else {
      setFormTags([]);
    }
    setTagInput('');
    setEditingId(item.id);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setFormTags([]);
    setTagInput('');
    setError(null);
  };

  // ── Gerenciamento de tags no formulário ──────────────────────────────────

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !formTags.includes(t)) {
      setFormTags((prev) => [...prev, t]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && tagInput === '' && formTags.length > 0) {
      setFormTags((prev) => prev.slice(0, -1));
    }
  };

  const removeFormTag = (tag: string) => {
    setFormTags((prev) => prev.filter((t) => t !== tag));
  };

  // ── Salvar item ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let savedId: number | undefined;
      if (isEditingSistema) {
        if (editingId === 'new') {
          const created = await createSistema(formData as any, token);
          savedId = created.id;
        } else {
          await updateSistema(editingId as number, formData, token);
          savedId = editingId as number;
        }
      } else {
        if (editingId === 'new') {
          const created = await createLink(formData as any, token);
          savedId = created.id;
        } else {
          await updateLink(editingId as number, formData, token);
          savedId = editingId as number;
        }
        // Salva as tags no localStorage (somente para links)
        if (savedId !== undefined) {
          setTagsForLink(savedId, formTags);
        }
      }
      cancelEdit();
      loadData();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Confirma a exclusão?')) return;
    setLoading(true);
    try {
      if (isEditingSistema) await deleteSistema(id, token);
      else await deleteLink(id, token);
      loadData();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reordenação ─────────────────────────────────────────────────────────

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    if (!token) return;
    setSavingOrder(true);
    setError(null);
    try {
      if (isEditingSistema) {
        await reorderSistemas(items as Sistema[], token);
      } else {
        await reorderLinks(items as LinkUtil[], token);
      }
      setOrderChanged(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar a ordem.');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Painel de Administração</h2>
            <p className="text-xs text-gray-500">Bem-vindo, {usuario?.nome}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { logout(); onClose(); }}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Sair
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-3 gap-4">
          {(['sistemas', 'links', 'usuarios'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); cancelEdit(); }}
              className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                activeTab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t === 'usuarios' ? 'Usuários' : t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {activeTab !== 'usuarios' && (
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-900 capitalize">
                Gerenciar {activeTab}
              </h3>
              <div className="flex items-center gap-2">
                {orderChanged && (
                  <button
                    onClick={handleSaveOrder}
                    disabled={savingOrder}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
                  >
                    <Save size={13} />
                    {savingOrder ? 'Salvando...' : 'Salvar Ordem'}
                  </button>
                )}
                <button
                  onClick={openNew}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
            </div>
          )}

          {/* Form: New or Edit */}
          {activeTab !== 'usuarios' && editingId !== null && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-primary">
                {editingId === 'new' ? 'Novo item' : 'Editar item'}
              </h3>
              {['nome', 'descricao', 'icone', 'url'].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field}</label>
                  <input
                    type={field === 'url' ? 'url' : 'text'}
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={field === 'icone' ? 'Ex: Building, Users, FileText...' : ''}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              ))}

              {/* Campo de Etiquetas — somente para links */}
              {!isEditingSistema && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                    <Tag size={12} />
                    Etiquetas <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-xl bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
                    {formTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeFormTag(tag)}
                          className="text-blue-500 hover:text-blue-800 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={handleAddTag}
                      placeholder={formTags.length === 0 ? 'Digite e pressione Enter...' : ''}
                      className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Pressione Enter ou vírgula para adicionar uma etiqueta.</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  <Save size={14} />
                  Salvar
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          {activeTab !== 'usuarios' && items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-3 hover:border-gray-200 transition-colors"
            >
              {/* Controles de Ordem */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-300 hover:text-primary hover:bg-blue-50 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Mover para cima"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 text-gray-300 hover:text-primary hover:bg-blue-50 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Mover para baixo"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Número de posição */}
              <span className="text-xs font-bold text-gray-300 w-5 text-center shrink-0">
                {index + 1}
              </span>

              {/* Informações do item */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.nome}</p>
                <p className="text-xs text-gray-400 truncate">{item.url}</p>
                {/* Tags do link (somente na aba links) */}
                {activeTab === 'links' && (() => {
                  const tags = getTagsForLink(item.id);
                  return tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {/* Aviso de ordem não salva */}
          {orderChanged && activeTab !== 'usuarios' && editingId === null && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-4 py-3">
              <AlertCircle size={14} />
              Ordem alterada. Clique em <strong>Salvar Ordem</strong> para persistir as mudanças.
            </div>
          )}

          {/* Users List */}
          {activeTab === 'usuarios' && (
            <div className="space-y-3">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.nome}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email} <span className="font-bold">({u.perfil})</span></p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => {
                        const newNome = prompt('Novo nome:', u.nome);
                        if (newNome !== null) {
                          const newEmail = prompt('Novo e-mail:', u.email);
                          if (newEmail !== null) {
                            const newSenha = prompt('Nova senha (deixe em branco para manter a mesma):');
                            const data: any = { nome: newNome, email: newEmail };
                            if (newSenha) data.senha = newSenha;
                            updateUsuario(u.id, data, token!).then(() => {
                              loadData();
                              alert('Usuário atualizado com sucesso!');
                            }).catch(err => setError(err.message));
                          }
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Add Button */}
        {editingId === null && activeTab !== 'usuarios' && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={openNew}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary hover:text-primary rounded-xl py-3 text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Adicionar {activeTab === 'sistemas' ? 'sistema' : 'link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
