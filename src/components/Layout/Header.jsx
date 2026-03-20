import React, { useState } from 'react';
import { Sun, Moon, LogOut, User, Bell, X, Check, Eye, EyeOff, UserCheck, Edit2, Play } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, updateUserInfo } = useAuth();
  const navigate = useNavigate();
  const { toggleFinanceDemo, demoEnabled } = useFinance();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ 
    nome: user?.nome || '', 
    email: user?.email || '', 
    password: user?.password || '',
    foto: user?.foto || ''
  });
  const [saved, setSaved] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Monitorar notificações (unread messages do portal)
  React.useEffect(() => {
    const checkNotifications = () => {
      const unread = localStorage.getItem('portal_unread_messages') === 'true';
      setHasNotifications(unread);
    };

    // Escutar mudanças de outras abas
    window.addEventListener('storage', (e) => {
      if (e.key === 'portal_unread_messages') checkNotifications();
    });

    // Polling básico para mesma aba
    const interval = setInterval(checkNotifications, 2000);
    checkNotifications();

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkNotifications);
    };
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileFormData(prev => ({ ...prev, foto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDemo = () => {
    toggleFinanceDemo();
    navigate('/financeiro');
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserInfo({ ...user, ...profileFormData });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsProfileModalOpen(false);
    }, 1500);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden sm:block">
          Sistema de Gestão
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
          title="Alternar Tema"
        >
          {isDark ? (
            <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Notifications */}
        <button 
          onClick={() => {
            // Apenas removemos a navegação automática para evitar confusão se o usuário não pediu
            // Caso queira um menu de notificações, seria implementado aqui.
          }}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all relative group" 
          title="Notificações do Portal"
        >
          <Bell className={`w-5 h-5 ${hasNotifications ? 'animate-bounce text-blue-500' : ''}`} />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
          )}
        </button>

        {/* Demo shortcut */}
        <button
          onClick={handleDemo}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200"
          title="Abrir Demo/Configurações"
        >
          <Play className="w-4 h-4" />
          {demoEnabled ? 'Real' : 'Demo'}
        </button>
        <button
          onClick={handleDemo}
          className="sm:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          title="Demo/Configurações"
        >
          <Play className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-2"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
              {user?.nome || 'Usuário'}
            </p>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter mt-1">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Membro'}
            </p>
          </div>
          
          <div className="group relative">
            <button className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform overflow-hidden font-bold">
               {user?.foto ? (
                 <img src={user.foto} alt={user.nome} className="w-full h-full object-cover" />
               ) : (
                 user?.nome?.charAt(0) || <User className="w-5 h-5" />
               )}
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-2">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 sm:hidden">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.nome}</p>
              </div>
              <button
                onClick={() => {
                  setProfileFormData({ 
                    nome: user?.nome, 
                    email: user?.email, 
                    password: user?.password,
                    foto: user?.foto || ''
                  });
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                <UserCheck className="w-4 h-4 mr-3 text-blue-500" />
                Meu Perfil
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sair do Sistema
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Meu Perfil */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-2xl w-full max-w-lg p-8 space-y-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center text-gray-900 dark:text-white">
               <div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter italic">Meu Perfil</h2>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Altere seus dados de acesso</p>
               </div>
               <button onClick={() => setIsProfileModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group">
                 <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
               </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex justify-center mb-6">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden">
                       {profileFormData.foto ? (
                         <img src={profileFormData.foto} className="w-full h-full object-cover" />
                       ) : (
                         user?.nome?.charAt(0)
                       )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-blue-500 cursor-pointer hover:scale-110 transition-transform">
                       <Edit2 className="w-4 h-4" />
                       <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Nome Completo</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white" 
                    value={profileFormData.nome} 
                    onChange={e => setProfileFormData({...profileFormData, nome: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">E-mail (Login)</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white" 
                    value={profileFormData.email} 
                    onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Senha</label>
                  <div className="relative">
                    <input 
                      required 
                      type={showPassword ? "text" : "password"} 
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white pr-12" 
                      value={profileFormData.password} 
                      onChange={e => setProfileFormData({...profileFormData, password: e.target.value})} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)} 
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saved}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    saved 
                      ? 'bg-green-600 text-white shadow-green-500/20' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Atualizado!
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
