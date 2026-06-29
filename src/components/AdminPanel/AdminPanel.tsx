import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  getSistemas, getLinks,
  createSistema, updateSistema, deleteSistema,
  createLink, updateLink, deleteLink,
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
  const [activeTab, setActiveTab] = useState<Tab>('sistemas');
  const [items, setItems] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
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
    setEditingId(item.id);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setError(null);
  };

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      if (isEditingSistema) {
        if (editingId === 'new') await createSistema(formData as any, token);
        else await updateSistema(editingId as number, formData, token);
      } else {
        if (editingId === 'new') await createLink(formData as any, token);
        else await updateLink(editingId as number, formData, token);
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

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-fade-in overflow-hidden">
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

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {activeTab !== 'usuarios' && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 capitalize">
                Gerenciar {activeTab}
              </h3>
              <button
                onClick={() => openNew()}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                Adicionar
              </button>
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
          {activeTab !== 'usuarios' && items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.nome}</p>
                <p className="text-xs text-gray-400 truncate">{item.url}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-3">
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
