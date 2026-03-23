import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, User, Shield, Edit2, Trash2, X, Check, XCircle, AlertCircle, Settings2, Lock, Eye, EyeOff } from 'lucide-react';

export default function Usuarios() {
  const { dbUsers, setDbUsers, updateUserInfo } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nome: '', email: '', role: 'USER', status: 'ACTIVE', password: '', foto: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [permissoesData, setPermissoesData] = useState({});

  const filteredUsers = dbUsers.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (userToApprove) => {
    updateUserInfo({ ...userToApprove, status: 'ACTIVE' });
  };

  const handleToggleStatus = (u) => {
    updateUserInfo({ ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  };

  const handleDelete = (id) => {
    setDbUsers((prev) => prev.filter((u) => u.id !== id));
    if (editingUser?.id === id) setEditingUser(null);
    setIsModalOpen(false);
    setIsPermissionsModalOpen(false);
  };

  const openPermissions = (u) => {
    setEditingUser(u);
    setPermissoesData(u.permissoes || {});
    setIsPermissionsModalOpen(true);
  };

  const handleSavePermissions = () => {
    updateUserInfo({ ...editingUser, permissoes: permissoesData });
    setIsPermissionsModalOpen(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, foto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUserInfo({ ...editingUser, ...formData });
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...formData
      };
      setDbUsers(prev => [...prev, newUser]);
    }
    setIsModalOpen(false);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setFormData({ nome: u.nome, email: u.email, role: u.role, status: u.status, password: u.password || '', foto: u.foto || '' });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Gestão de Acessos</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Controle quem pode acessar e gerenciar o sistema.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({ nome: '', email: '', role: 'USER', status: 'ACTIVE' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Alerta de Pendências */}
      {dbUsers.some(u => u.status === 'PENDING') && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-3xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm font-black uppercase tracking-tighter italic">Existem solicitações de acesso pendentes!</span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Usuário</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Nível de Acesso</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                         {u.foto ? (
                           <img src={u.foto} alt={u.nome} className="w-full h-full object-cover" />
                         ) : (
                           <User className="w-5 h-5 text-gray-400" />
                         )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{u.nome}</span>
                        <span className="text-xs text-gray-500 underline">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       {u.role === 'ADMIN' ? (
                         <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                           <Shield className="w-3 h-3" /> Administrador
                         </span>
                       ) : (
                         <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                           <User className="w-3 h-3" /> Usuário Comum
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {u.status === 'PENDING' ? (
                       <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800 animate-pulse">
                          Aguardando Liberação
                       </span>
                    ) : u.status === 'INACTIVE' ? (
                       <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                          Desativado
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full border border-green-100 dark:border-green-800">
                          Ativo
                       </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                        {u.status === 'PENDING' ? (
                           <button onClick={() => handleApprove(u)} title="Aprovar Acesso" className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 hover:bg-green-200 rounded-xl transition-all shadow-lg shadow-green-500/10">
                              <Check className="w-4 h-4" />
                           </button>
                        ) : (
                           <button onClick={() => handleToggleStatus(u)} title={u.status === 'ACTIVE' ? "Desativar" : "Ativar"} className={`p-2 rounded-xl transition-all ${u.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/40' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/40'}`}>
                              {u.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                        )}
                        <button onClick={() => openPermissions(u)} title="Gerenciar Permissões" className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all">
                             <Lock className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all">
                             <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
                             <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Permissões */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-2xl w-full max-w-xl p-8 space-y-6 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center text-gray-900 dark:text-white">
               <div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter italic">Gerenciar Permissões</h2>
                 <p className="text-xs text-gray-500">Configurando acesso para: <span className="font-bold text-blue-600">{editingUser?.nome}</span></p>
               </div>
               <button onClick={() => setIsPermissionsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'membros', label: 'Membros' },
                { id: 'visitantes', label: 'Visitantes' },
                { id: 'ministerios', label: 'Ministérios' },
                { id: 'patrimonio', label: 'Patrimônio' },
                { id: 'relatorios', label: 'Relatórios' },
                { id: 'portal', label: 'Portal Transparência' },
                { id: 'paginas', label: 'Páginas (Conteúdo)' },
              ].map(module => (
                <div key={module.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-blue-500/30 transition-all">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{module.label}</span>
                  <button 
                    onClick={() => setPermissoesData(p => ({ ...p, [module.id]: !p[module.id] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${permissoesData[module.id] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissoesData[module.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}

              <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                <label className="block text-[10px] font-black uppercase text-blue-600 tracking-widest mb-3">Controle Financeiro</label>
                <div className="flex gap-2">
                  {['none', 'view', 'edit'].map(mode => (
                    <button 
                      key={mode} 
                      onClick={() => setPermissoesData(p => ({ ...p, financeiro: mode }))}
                      className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                        (permissoesData.financeiro || 'none') === mode 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {mode === 'none' ? 'Nenhum' : mode === 'view' ? 'Ver' : 'Editar'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={() => setIsPermissionsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
              <button onClick={handleSavePermissions} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95">Salvar Permissões</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 text-gray-900 dark:text-white">
          <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-2xl w-full max-w-lg p-8 space-y-6 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center text-gray-900 dark:text-white">
               <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Foto de Perfil */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden">
                    {formData.foto ? (
                      <img src={formData.foto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-all scale-90 group-hover:scale-100">
                    <Edit2 className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Nome Completo</label>
                <input required type="text" placeholder="Ex: Lucas Ferreira" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">E-mail</label>
                <input required type="email" placeholder="email@igreja.com" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Nível de Acesso</label>
                  <select className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-800 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="USER">Usuário Comum</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Status</label>
                  <select className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-800 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">Ativo</option>
                    <option value="PENDING">Pendente</option>
                    <option value="INACTIVE">Desativado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Senha de Acesso</label>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Defina uma senha" 
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all text-gray-900 dark:text-white pr-12" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
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

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
