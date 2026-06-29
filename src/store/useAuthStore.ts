import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, type LoginResponse, type UsuarioLogado } from '../services/api';

interface AuthState {
  token: string | null;
  usuario: UsuarioLogado | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      isAdmin: false,
      isEditor: false,

      login: async (email, senha) => {
        const data: LoginResponse = await apiLogin(email, senha);
        set({
          token: data.token,
          usuario: data.usuario,
          isAuthenticated: true,
          isAdmin: data.usuario.perfil === 'ADMIN',
          isEditor: data.usuario.perfil === 'EDITOR',
        });
      },

      logout: () => {
        set({ token: null, usuario: null, isAuthenticated: false, isAdmin: false, isEditor: false });
      },
    }),
    { name: 'intranet-auth' }
  )
);
