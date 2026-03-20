import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, X, Mail, BookOpen, Phone, Lock, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Membros() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '', endereco: '', ministerio: 'Louvor' });
  
  const [membros, setMembros] = useState(() => {
    try {
      const saved = localStorage.getItem('igreja_membros');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading membros:", e);
    }
    return [
      { id: 1, nome: 'Maria Silva', telefone: '(11) 98888-7777', email: 'maria@email.com', endereco: 'Rua das Flores, 123', ministerio: 'Louvor' },
      { id: 2, nome: 'João Santos', telefone: '(11) 97777-6666', email: 'joao@email.com', endereco: 'Av. Brasil, 500', ministerio: 'Infantil' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('igreja_membros', JSON.stringify(membros));
  }, [membros]);

  const hasAccess = isAdmin || user?.permissoes?.membros === true;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Acesso Restrito</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Você não tem permissão para visualizar este módulo.</p>
      </div>
    );
  }

  const filtered = membros.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.ministerio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setMembros(prev => prev.map(m => m.id === editingId ? { ...formData, id: editingId } : m));
    } else {
      setMembros(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setFormData({ ...m });
    setIsModalOpen(true);
  };

  const handlePublishToPortal = (membro) => {
    const pendingItem = {
      ...membro,
      _type: 'membros'
    };
    localStorage.setItem('portal_pending_selection', JSON.stringify(pendingItem));
    navigate('/configuracoes');
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ nome: '', telefone: '', email: '', endereco: '', ministerio: 'Louvor' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Rol de Membros</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Gestão completa do corpo de membros da igreja.</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou ministério..."
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
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome Completo</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Contato</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Ministério</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-900 dark:text-gray-100">
              {filtered.map((m) => (
                <tr key={m.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                          {m.nome.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold">{m.nome}</span>
                          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{m.endereco}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors group-hover:text-blue-600">
                          <Phone className="w-3 h-3" /> {m.telefone}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                          <Mail className="w-3 h-3" /> {m.email}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      <BookOpen className="w-3 h-3" /> {m.ministerio}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 text-gray-900 dark:text-gray-100">
                        <button onClick={() => handlePublishToPortal(m)} title="Publicar no Portal" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-xl transition-all">
                           <Send className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(m)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setMembros(ms => ms.filter(me => me.id !== m.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-2xl w-full max-w-lg p-8 space-y-6 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center text-gray-900 dark:text-white">
               <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingId ? 'Editar Membro' : 'Novo Membro'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Nome Completo</label>
                <input required type="text" placeholder="Ex: Maria da Silva" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Telefone</label>
                  <input required type="text" placeholder="(00) 00000-0000" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Ministério</label>
                  <select className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.ministerio} onChange={e => setFormData({...formData, ministerio: e.target.value})}>
                    <option value="Louvor">Louvor</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Jovens">Jovens</option>
                    <option value="Missões">Missões</option>
                    <option value="Diaconato">Diaconato</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">E-mail</label>
                <input type="email" placeholder="email@exemplo.com" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Endereço Residencial</label>
                <input type="text" placeholder="Rua, Número, Bairro" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">Salvar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
