import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, Download, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, Calendar, FileText, Lock, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Financeiro() {
  const { finances, addTransaction, deleteTransaction, updateTransaction, demoEnabled, isDemoTransactionId } = useFinance();
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // New state for editing
  const [formData, setFormData] = useState({ type: 'entrada', value: '', description: '', category: 'Ofertas', date: new Date().toISOString().split('T')[0] });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTransaction) {
      updateTransaction({
        ...formData,
        value: parseFloat(formData.value),
        id: editingTransaction.id
      });
    } else {
      addTransaction({
        ...formData,
        value: parseFloat(formData.value),
        id: Date.now()
      });
    }
    setFormData({ type: 'entrada', value: '', description: '', category: 'Ofertas', date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const openEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      value: transaction.value,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (isDemoTransactionId(id)) return;
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id);
    }
  };

  const canAddEdit = isAdmin || user?.permissoes?.financeiro === 'edit' || demoEnabled;
  const canView = isAdmin || user?.permissoes?.financeiro === 'view' || canAddEdit;

  if (!canView) {
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

  const filteredTransactions = finances.transactions.filter(t =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Livro Caixa</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Gestão detalhada de todas as movimentações financeiras.</p>
        </div>
        {canAddEdit && (
          <button
            onClick={() => { setEditingTransaction(null); setFormData({ type: 'entrada', value: '', description: '', category: 'Ofertas', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar descrição ou categoria..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <button className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <Filter className="w-4 h-4 text-gray-500" />
             </button>
             <button className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-xs flex items-center gap-2 text-gray-500 translate-x-0">
                <Calendar className="w-4 h-4" /> Maio 2024
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Descrição</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Categoria</th>
                <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Data</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${t.type === 'entrada' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                          {t.type === 'entrada' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                       </div>
                       <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{t.category}</span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(t.date))}
                  </td>
                  <td className={`px-8 py-5 text-right text-sm font-black tracking-widest ${t.type === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.value)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                        {canAddEdit ? (
                          isDemoTransactionId(t.id) ? (
                            <span className="text-[10px] text-gray-400 uppercase font-bold italic tracking-widest px-2">Demo</span>
                          ) : (
                            <>
                              <button onClick={() => openEdit(t)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all">
                                  <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )
                        ) : (
                          <span className="text-[10px] text-gray-400 uppercase font-bold italic tracking-widest px-2">Apenas Visualização</span>
                        )}
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
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black uppercase tracking-tighter italic">Nova Transação</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl gap-1">
                 <button type="button" onClick={() => setFormData({...formData, type: 'entrada'})} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${formData.type === 'entrada' ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600' : 'text-gray-500'}`}>Entrada</button>
                 <button type="button" onClick={() => setFormData({...formData, type: 'saida'})} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${formData.type === 'saida' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-500' : 'text-gray-500'}`}>Saída</button>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Descrição</label>
                <input required type="text" placeholder="Ex: Oferta de Domingo" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Valor (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Data</label>
                  <input required type="date" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold uppercase transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">Categoria</label>
                <select className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:bg-gray-50 dark:focus:bg-gray-900 outline-none text-sm font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Ofertas">Ofertas</option>
                  <option value="Dízimos">Dízimos</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Contas">Contas Fixas</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Patrimônio">Patrimônio</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">Salvar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
