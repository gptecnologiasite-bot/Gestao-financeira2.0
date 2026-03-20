import React, { useEffect, useState } from 'react';
import { Plus, Search, Package, DollarSign, Calendar, Edit2, Trash2, X, Lock, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Patrimonio() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const safeParseJSON = (raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const hasAccess = isAdmin || user?.permissoes?.patrimonio === true;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', valor: 0, dataAquisicao: new Date().toISOString().split('T')[0], estado: 'Novo' });
  const [bens, setBens] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('igreja_patrimonio_bens'));
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return [
      { id: 1, nome: 'Mesa de Som Yamaha 16ch', valor: 4500, dataAquisicao: '2022-05-10', estado: 'Bom' },
      { id: 2, nome: 'Projetor Epson', valor: 3200, dataAquisicao: '2023-01-15', estado: 'Novo' },
      { id: 3, nome: 'Ar Condicionado 30.000 BTUs', valor: 5500, dataAquisicao: '2021-11-20', estado: 'Manutenção' },
      { id: 4, nome: 'Teclado Roland Juno DS', valor: 6000, dataAquisicao: '2023-08-05', estado: 'Novo' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('igreja_patrimonio_bens', JSON.stringify(bens));
  }, [bens]);

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

  const filtered = bens.filter(b => 
    b.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString) => 
    new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setBens(prev => prev.map(b => b.id === editingId ? { ...formData, id: editingId } : b));
    } else {
      setBens(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const openEdit = (b) => {
    setEditingId(b.id);
    setFormData({ ...b });
    setIsModalOpen(true);
  };

  const handlePublishToPortal = (bem) => {
    const pendingItem = {
      ...bem,
      _type: 'patrimonio'
    };
    localStorage.setItem('portal_pending_selection', JSON.stringify(pendingItem));
    navigate('/configuracoes');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Patrimônio</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Gerenciamento e inventário de bens materiais.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ nome: '', valor: 0, dataAquisicao: new Date().toISOString().split('T')[0], estado: 'Novo' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Novo Bem
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden text-gray-900 dark:text-gray-100">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 font-bold">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou estado..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Equipamento/Bem</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Aquisição</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Estado</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor Estimado</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((bem) => (
                <tr key={bem.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-bold">{bem.nome}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 opacity-50" /> {formatDate(bem.dataAquisicao)}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase
                      ${bem.estado === 'Novo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        bem.estado === 'Manutenção' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {bem.estado}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-black whitespace-nowrap">
                    {formatCurrency(bem.valor)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 text-gray-900 dark:text-gray-100">
                      <button onClick={() => handlePublishToPortal(bem)} title="Publicar no Portal" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-xl transition-all">
                        <Send className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(bem)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setBens(bs => bs.filter(b => b.id !== bem.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
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
               <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingId ? 'Editar Bem' : 'Novo Bem'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 font-bold">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Nome do Equipamento</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-indigo-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Valor (R$)</label>
                  <input required type="number" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-indigo-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.valor} onChange={e => setFormData({...formData, valor: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Data Aquisição</label>
                  <input required type="date" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-indigo-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all uppercase" value={formData.dataAquisicao} onChange={e => setFormData({...formData, dataAquisicao: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Estado de Conservação</label>
                <select className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-indigo-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                  <option value="Novo">Novo</option>
                  <option value="Bom">Bom estado</option>
                  <option value="Usado">Usado</option>
                  <option value="Manutenção">Em Manutenção</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95">Salvar Patrimônio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
