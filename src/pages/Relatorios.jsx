import React, { useState, useMemo } from 'react';
import { FileText, Download, Filter, MessageCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export default function Relatorios() {
  const { user, isAdmin } = useAuth();
  const { finances } = useFinance();
  const { transactions: realTransactions = [], categories = [] } = finances;
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedMinistry, setSelectedMinistry] = useState('Geral');

  const hasAccess = isAdmin || user?.permissoes?.relatorios === true;

  const filteredTransactions = useMemo(() => {
    return realTransactions.filter(t => {
      const dateMatch = (!dateRange.start || t.date >= dateRange.start) && 
                        (!dateRange.end || t.date <= dateRange.end);
      const categoryMatch = selectedCategory === 'Todas' || (t.category || t.categoria) === selectedCategory;
      const ministryMatch = selectedMinistry === 'Geral' || (t.ministry || t.ministerio) === selectedMinistry;
      return dateMatch && categoryMatch && ministryMatch;
    });
  }, [realTransactions, dateRange, selectedCategory, selectedMinistry]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const type = (t.type || t.tipo || '').toLowerCase();
      const value = Number(t.value || t.valor || 0);
      if (type === 'entrada') acc.entradas += value;
      else acc.saidas += value;
      acc.saldo = acc.entradas - acc.saidas;
      return acc;
    }, { entradas: 0, saidas: 0, saldo: 0 });
  }, [filteredTransactions]);

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

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const exportPDF = async () => {
    setLoading(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) throw new Error("Elemento de relatório não encontrado");
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Ajustar se a altura for maior que a página (simplificado)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio-financeiro-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
    } catch (e) {
      console.error("Erro ao exportar PDF:", e);
      alert("Houve um erro ao gerar o PDF. Verifique se o conteúdo do relatório está carregado.");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const data = [
      ['Data', 'Descrição', 'Categoria', 'Ministério', 'Valor', 'Tipo'],
      ...filteredTransactions.map(t => [
        t.date || t.data, 
        t.description || t.descricao, 
        t.category || t.categoria, 
        t.ministry || t.ministerio || 'Geral', 
        (t.value || t.valor || 0).toFixed(2), 
        (t.type || t.tipo || 'saída').toUpperCase()
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financeiro');
    XLSX.writeFile(wb, `financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`Relatório Financeiro Gerado: Entradas ${formatCurrency(totals.entradas)}, Saídas ${formatCurrency(totals.saidas)}. Saldo: ${formatCurrency(totals.saldo)}`);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Relatórios Financeiros</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Gere documentos consolidados para prestação de contas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2 font-black uppercase text-xs tracking-widest">
            <Filter className="w-5 h-5" />
            <h2>Filtros</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Período</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                <input type="date" className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Categoria</label>
              <select className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="Todas">Todas as Categorias</option>
                {categories.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Ministério</label>
              <select className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={selectedMinistry} onChange={e => setSelectedMinistry(e.target.value)}>
                <option value="Geral">Geral / Todos</option>
                <option value="Louvor">Louvor</option>
                <option value="Infantil">Infantil</option>
                <option value="Missões">Missões</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
             <button onClick={exportPDF} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-500/20 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50">
                {loading ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : <FileText className="w-4 h-4" />}
                Exportar para PDF
             </button>
             <button onClick={exportExcel} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg shadow-green-500/20 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95">
                <Download className="w-4 h-4" />
                Exportar para Excel
             </button>
            <button onClick={shareWhatsApp} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95">
              <MessageCircle className="w-4 h-4" />
              Compartilhar Resumo
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div id="report-content" className="bg-white p-10 text-gray-900 h-full min-h-[600px] border border-gray-100 rounded-4xl shadow-2xl scale-[0.98]">
            <div className="flex justify-between items-start border-b-4 border-gray-900 pb-8 mb-10">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Relatório de Gestão</h2>
                <p className="text-sm font-bold text-gray-500">Igreja Evangélica - Todos os Direitos Reservados</p>
              </div>
              <div className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <p>Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                <p>Status: Documento Oficial</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Entradas</p>
                <p className="text-2xl font-black text-green-700">{formatCurrency(totals.entradas)}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Saídas</p>
                <p className="text-2xl font-black text-red-700">{formatCurrency(totals.saidas)}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Resultado Líquido</p>
                <p className="text-2xl font-black text-blue-700">{formatCurrency(totals.saldo)}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="border-b-2 border-gray-900">
                <tr>
                   <th className="py-3 text-[10px] font-black uppercase tracking-widest">Data</th>
                   <th className="py-3 text-[10px] font-black uppercase tracking-widest">Descrição / Histórico</th>
                   <th className="py-3 text-[10px] font-black uppercase tracking-widest">Categoria</th>
                   <th className="py-3 text-[10px] font-black uppercase tracking-widest text-right">Valor Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length > 0 ? filteredTransactions.map((t, i) => (
                  <tr key={t.id || i} className="text-xs">
                    <td className="py-4 font-bold">{new Date(t.date || t.data).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 font-black uppercase text-gray-600">{t.description || t.descricao}</td>
                    <td className="py-4 font-bold text-gray-500">{t.category || t.categoria}</td>
                    <td className={`py-4 text-right font-black ${
                      (t.type || t.tipo || '').toLowerCase() === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(t.type || t.tipo || '').toLowerCase() === 'entrada' ? '+' : '-'} {formatCurrency(t.value || t.valor || 0)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center font-bold text-gray-400">Nenhuma transação encontrada para os filtros selecionados.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-20 flex flex-col items-center">
                <div className="w-64 h-px bg-gray-900 mb-2"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Assinatura do Responsável</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
