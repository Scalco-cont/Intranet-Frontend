const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface Sistema {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  url: string;
  ativo: boolean;
  ordem_exibicao: number;
}

export interface LinkUtil {
  id: number;
  nome: string;
  descricao: string;
  url: string;
  icone: string;
  ativo: boolean;
  ordem_exibicao: number;
}

export interface Comunicado {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: string;
  prioridade: 'normal' | 'importante' | 'urgente';
  autor: string;
  fixado: boolean;
  reacoes: Record<string, number>;
  total_comentarios: number;
  criado_em: string;
  atualizado_em: string;
}

export interface Comentario {
  id: number;
  comunicado_id: number;
  autor_nome: string;
  comentario: string;
  criado_em: string;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'EDITOR';
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioLogado;
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

// ─── Sistemas ──────────────────────────────────────────────────────────────

export const getSistemas = (): Promise<Sistema[]> =>
  fetchJson<Sistema[]>('/sistemas');

export const createSistema = (data: Omit<Sistema, 'id' | 'ativo' | 'ordem_exibicao'>, token: string): Promise<Sistema> =>
  fetchJson<Sistema>('/sistemas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const updateSistema = (id: number, data: Partial<Sistema>, token: string): Promise<Sistema> =>
  fetchJson<Sistema>(`/sistemas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const deleteSistema = (id: number, token: string): Promise<void> =>
  fetchJson<void>(`/sistemas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

// ─── Links ─────────────────────────────────────────────────────────────────

export const getLinks = (): Promise<LinkUtil[]> =>
  fetchJson<LinkUtil[]>('/links');

export const createLink = (data: Omit<LinkUtil, 'id' | 'ativo' | 'ordem_exibicao'>, token: string): Promise<LinkUtil> =>
  fetchJson<LinkUtil>('/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const updateLink = (id: number, data: Partial<LinkUtil>, token: string): Promise<LinkUtil> =>
  fetchJson<LinkUtil>(`/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const deleteLink = (id: number, token: string): Promise<void> =>
  fetchJson<void>(`/links/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

// ─── Comunicados ───────────────────────────────────────────────────────────

export const getComunicados = (): Promise<Comunicado[]> =>
  fetchJson<Comunicado[]>('/comunicados');

export const getComunicado = (id: number): Promise<Comunicado & { comentarios: Comentario[] }> =>
  fetchJson(`/comunicados/${id}`);

export const createComunicado = (data: Pick<Comunicado, 'titulo' | 'conteudo' | 'categoria' | 'prioridade'>, token: string): Promise<Comunicado> =>
  fetchJson<Comunicado>('/comunicados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const updateComunicado = (id: number, data: Partial<Pick<Comunicado, 'titulo' | 'conteudo' | 'categoria' | 'prioridade'>>, token: string): Promise<Comunicado> =>
  fetchJson<Comunicado>(`/comunicados/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const deleteComunicado = (id: number, token: string): Promise<void> =>
  fetchJson<void>(`/comunicados/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

export const fixarComunicado = (id: number, token: string): Promise<{ fixado: boolean }> =>
  fetchJson(`/comunicados/${id}/fixar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });

export const getComentarios = (comunicadoId: number): Promise<Comentario[]> =>
  fetchJson<Comentario[]>(`/comunicados/${comunicadoId}/comentarios`);

export const createComentario = (comunicadoId: number, data: Pick<Comentario, 'autor_nome' | 'comentario'>): Promise<Comentario> =>
  fetchJson<Comentario>(`/comunicados/${comunicadoId}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteComentario = (comunicadoId: number, comentarioId: number, token: string): Promise<void> =>
  fetchJson(`/comunicados/${comunicadoId}/comentarios/${comentarioId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

export const reagir = (comunicadoId: number, emoji: string, cliente_id: string): Promise<{ reacoes: Record<string, number> }> =>
  fetchJson(`/comunicados/${comunicadoId}/reacoes`, {
    method: 'POST',
    body: JSON.stringify({ emoji, cliente_id }),
  });

// ─── Auth ──────────────────────────────────────────────────────────────────

export const login = (email: string, senha: string): Promise<LoginResponse> =>
  fetchJson<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

// ─── Usuários (Admin) ────────────────────────────────────────────────────────

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'EDITOR';
}

export const getUsuarios = (token: string): Promise<Usuario[]> =>
  fetchJson<Usuario[]>('/auth/usuarios', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUsuario = (id: number, data: Partial<{ nome: string; email: string; senha: string }>, token: string): Promise<Usuario> =>
  fetchJson<Usuario>(`/auth/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const checkUrl = async (url: string): Promise<{ isUp: boolean }> => {
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store' });
    return { isUp: true };
  } catch (error) {
    return { isUp: false };
  }
};
