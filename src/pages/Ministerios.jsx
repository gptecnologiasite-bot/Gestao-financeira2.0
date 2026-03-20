import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, X, BookOpen, Edit2, Trash2, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Ministerios() {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [ministerios, setMinisterios] = useState(() => {
    try {
      const saved = localStorage.getItem('igreja_ministerios');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading ministerios:", e);
    }
    return [
      { id: 1, nome: 'Louvor', lider: 'João Silva', membrosCount: 15, orcamentoAnual: 5000 },
      { id: 2, nome: 'Infantil', lider: 'Maria Oliveira', membrosCount: 12, orcamentoAnual: 3500 },
      { id: 3, nome: 'Jovens', lider: 'Carlos Mendes', membrosCount: 25, orcamentoAnual: 8000 },
      { id: 4, nome: 'Missões', lider: 'Ana Paula', membrosCount: 8, orcamentoAnual: 12000 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('igreja_ministerios', JSON.stringify(ministerios));
  }, [ministerios]);

  const hasAccess = isAdmin || user?.permissoes?.ministerios === true;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', lider: '', membrosCount: 0, orcamentoAnual: 0 });

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

  const filtered = ministerios.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.lider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setMinisterios(prev => prev.map(m => m.id === editingId ? { ...formData, id: editingId } : m));
    } else {
      setMinisterios(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setFormData({ ...m });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Ministérios</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Gerencie os departamentos da igreja e seus fluxos.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ nome: '', lider: '', membrosCount: 0, orcamentoAnual: 0 }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Novo Ministério
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ministério ou líder..."
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
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome do Ministério</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Líder Responsável</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Equipe</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Orçamento</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-900 dark:text-gray-100">
              {filtered.map((min) => (
                <tr key={min.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">{min.nome}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {min.lider}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      <Users className="w-3 h-3" /> {min.membrosCount} membros
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-black">
                    {formatCurrency(min.orcamentoAnual)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 text-gray-900 dark:text-gray-100">
                      <button onClick={() => openEdit(min)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setMinisterios(ms => ms.filter(mi => mi.id !== min.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
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
               <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingId ? 'Editar Ministério' : 'Novo Ministério'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Nome do Ministério</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Líder</label>
                  <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.lider} onChange={e => setFormData({...formData, lider: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Nº Integrantes</label>
                  <input required type="number" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.membrosCount} onChange={e => setFormData({...formData, membrosCount: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Orçamento Anual (R$)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 text-sm font-bold">R$</div>
                   <input required type="number" className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.orcamentoAnual} onChange={e => setFormData({...formData, orcamentoAnual: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">Salvar Ministério</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
