import { useState, useRef, useEffect } from 'react';
import { User, ShieldCheck, LogOut, Settings, Pencil } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { LoginModal } from '../LoginModal/LoginModal';
import { AdminPanel } from '../AdminPanel/AdminPanel';


interface HeaderProps {
  onRefresh: () => void;
}

export function Header({ onRefresh }: HeaderProps) {
  const { isAuthenticated, isAdmin, isEditor, usuario, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleLabel = isAdmin ? '● Administrador' : isEditor ? '● RH' : 'Clique para opções';
  const roleLabelColor = isAuthenticated ? 'text-primary' : 'text-gray-400';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-xl">
              <span className="font-bold text-xl leading-none">In</span>
            </div>
            <span className="font-bold text-xl hidden sm:block text-gray-800">Intranet</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* User avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-3 pl-3 border-l border-gray-200"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">
                    {isAuthenticated ? usuario?.nome : 'Colaborador'}
                  </span>
                  <span className={`text-xs font-medium ${roleLabelColor}`}>
                    {roleLabel}
                  </span>
                </div>
                <div className={`p-2 rounded-full transition-colors ${
                  isAuthenticated
                    ? 'bg-primary text-white hover:bg-blue-700'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}>
                  <User size={20} />
                </div>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs font-semibold text-gray-900">{usuario?.nome}</p>
                        <p className="text-xs text-gray-400">{usuario?.email}</p>
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isAdmin ? 'Administrador' : 'RH'}
                        </span>
                      </div>
                      {/* Painel Admin — apenas para Admin */}
                      {isAdmin && (
                        <button
                          onClick={() => { setShowAdmin(true); setShowDropdown(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                        >
                          <Settings size={16} className="text-primary" />
                          Painel de Administração
                        </button>
                      )}
                      {isEditor && (
                        <div className="px-4 py-2 text-xs text-gray-400 flex items-center gap-2">
                          <Pencil size={13} />
                          Pode publicar comunicados
                        </div>
                      )}
                      <button
                        onClick={() => { logout(); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400">Área restrita</p>
                      </div>
                      <button
                        onClick={() => { setShowLogin(true); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      >
                        <ShieldCheck size={16} className="text-blue-600" />
                        Entrar como Administrador
                      </button>
                      <button
                        onClick={() => { setShowLogin(true); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <Pencil size={16} className="text-purple-500" />
                        Entrar como RH
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showAdmin && isAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
