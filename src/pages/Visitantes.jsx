import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, Edit2, Trash2, X, Calendar, Lock, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Visitantes() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [visitantes, setVisitantes] = useState(() => {
    try {
      const saved = localStorage.getItem('igreja_visitantes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading visitantes:", e);
    }
    return [
      { id: 1, nome: 'Ricardo Santos', dataVisita: '2024-03-15', observacoes: 'Gostou do louvor, mora no bairro.' },
      { id: 2, nome: 'Alice Ferreira', dataVisita: '2024-03-10', observacoes: 'Visitando com a família do João.' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('igreja_visitantes', JSON.stringify(visitantes));
  }, [visitantes]);

  const hasAccess = isAdmin || user?.permissoes?.visitantes === true;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', dataVisita: new Date().toISOString().split('T')[0], observacoes: '' });

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Acesso Restrito</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Você não tem permissão para visualizar este módulo.</p>
      </div>
    );
  }

  const filtered = visitantes.filter(v => 
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.observacoes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => 
    new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setVisitantes(prev => prev.map(v => v.id === editingId ? { ...formData, id: editingId } : v));
    } else {
      setVisitantes(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const openEdit = (v) => {
    setEditingId(v.id);
    setFormData({ ...v });
    setIsModalOpen(true);
  };

  const handlePublishToPortal = (visitante) => {
    const pendingItem = {
      ...visitante,
      _type: 'visitantes'
    };
    localStorage.setItem('portal_pending_selection', JSON.stringify(pendingItem));
    navigate('/configuracoes');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Visitantes</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Acompanhamento e integração de novos visitantes.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ nome: '', dataVisita: new Date().toISOString().split('T')[0], observacoes: '' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Registrar Visita
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden text-gray-900 dark:text-gray-100">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 font-bold">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar visitante..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Visitante</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Data da Visita</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Observações</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((vis) => (
                <tr key={vis.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold">{vis.nome}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {formatDate(vis.dataVisita)}</div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate font-medium">
                    {vis.observacoes}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 text-gray-900 dark:text-gray-100">
                      <button onClick={() => handlePublishToPortal(vis)} title="Publicar no Portal" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-xl transition-all">
                        <Send className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(vis)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setVisitantes(vs => vs.filter(vi => vi.id !== vis.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
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
               <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingId ? 'Editar Visita' : 'Novo Visitante'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 font-medium">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Nome Completo</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Data da Visita</label>
                <input required type="date" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all uppercase" value={formData.dataVisita} onChange={e => setFormData({...formData, dataVisita: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Observações</label>
                <textarea rows="3" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all resize-none" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} placeholder="Interesses, quem convidou..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
