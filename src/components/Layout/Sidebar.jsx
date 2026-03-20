import { NavLink } from 'react-router-dom';
import { Home, Users, DollarSign, BookOpen, Layers, FileText, Settings, UserCheck, ShieldCheck, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
  { name: 'Membros', path: '/membros', icon: Users },
  { name: 'Visitantes', path: '/visitantes', icon: UserCheck },
  { name: 'Ministérios', path: '/ministerios', icon: BookOpen },
  { name: 'Patrimônio', path: '/patrimonio', icon: Layers },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

export default function Sidebar() {
  const { isAdmin, user } = useAuth();
  const { branding } = useBranding();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = () => {
      const unread = localStorage.getItem('portal_unread_messages') === 'true';
      setHasUnread(unread);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 3000); // Verifica a cada 3s
    return () => clearInterval(interval);
  }, []);

  const clearNotification = () => {
    localStorage.removeItem('portal_unread_messages');
    setHasUnread(false);
  };

  const hasPermission = (module) => {
    if (isAdmin) return true;
    return user?.permissoes?.[module] === true || user?.permissoes?.[module] === 'view' || user?.permissoes?.[module] === 'edit';
  };

  const filteredNavItems = navItems.filter(item => {
    const moduleId = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return hasPermission(moduleId);
  });

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-xl shrink-0 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col z-20">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 bg-blue-600 dark:bg-blue-900/40 gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
            <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xs font-black text-white dark:text-blue-400 tracking-tighter uppercase italic truncate">
            {branding.title}
          </h1>
        </div>
        
        {isAdmin && (
          <div className="relative">
            <Bell className={`w-5 h-5 text-white/80 dark:text-blue-400/80 ${hasUnread ? 'animate-bounce' : ''}`} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-blue-600 dark:border-blue-900 rounded-full animate-pulse"></span>
            )}
          </div>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400'
              }`
            }
          >
            <item.icon className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-200 group-hover:scale-110`} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Settings Group */}
      {isAdmin && (
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
              isSettingsOpen ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center">
              <Settings className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-500 ${isSettingsOpen ? 'rotate-90' : ''}`} />
              Configurações
            </div>
            {isSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isSettingsOpen && (
            <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <NavLink
                to="/configuracoes"
                className={({ isActive }) =>
                  `flex items-center pl-12 pr-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                Geral
              </NavLink>
              
              <NavLink
                to="/usuarios"
                className={({ isActive }) =>
                  `flex items-center pl-12 pr-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                Usuários
              </NavLink>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
