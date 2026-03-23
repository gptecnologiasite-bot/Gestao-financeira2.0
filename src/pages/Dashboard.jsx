import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, ArrowUpRight, ArrowDownRight, Filter, Lock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard() {
  const { finances } = useFinance();
  const { isAdmin, user } = useAuth();
  const [filterType, setFilterType] = React.useState('month');

  const hasAccess = isAdmin || user?.permissoes?.dashboard === true;

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

  const mockChartData = filterType === 'month' ? [
    { name: 'Sem 1', entradas: 4000, saidas: 1200 },
    { name: 'Sem 2', entradas: 3000, saidas: 800 },
    { name: 'Sem 3', entradas: 5000, saidas: 1500 },
    { name: 'Sem 4', entradas: 3420, saidas: 700 },
  ] : [
    { name: 'Jan', entradas: 12000, saidas: 4000 },
    { name: 'Fev', entradas: 15000, saidas: 3000 },
    { name: 'Mar', entradas: 10000, saidas: 5000 },
    { name: 'Abr', entradas: 18000, saidas: 2000 },
    { name: 'Mai', entradas: 15420, saidas: 4200 },
  ];

  const pieData = [
    { name: 'Ofertas', value: 4500 },
    { name: 'Dízimos', value: 8500 },
    { name: 'Eventos', value: 1200 },
    { name: 'Doações', value: 1220 },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Visão Geral</h1>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {filterType === 'month' ? 'Resumo financeiro mensal (Maio 2024)' : 'Resumo financeiro anual consolidado (2024)'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
           <button 
             onClick={() => setFilterType('month')}
             className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === 'month' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
           >
             Mês
           </button>
           <button 
             onClick={() => setFilterType('year')}
             className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === 'year' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
           >
             Ano
           </button>
        </div>
      </div>
      
      {/* Premium Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entradas Card */}
        <div className="relative overflow-hidden group bg-white dark:bg-gray-900 rounded-4xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <TrendingUp className="w-24 h-24 text-green-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Entradas</span>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
              {formatCurrency(finances.totalEntradas)}
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full w-fit">
               <span>+12.5%</span>
               <span className="text-gray-400 font-medium">desde abr</span>
            </div>
          </div>
        </div>

        {/* Saídas Card */}
        <div className="relative overflow-hidden group bg-white dark:bg-gray-900 rounded-4xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500 text-red-500">
             <Target className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
                <ArrowDownRight className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Saídas</span>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
              {formatCurrency(finances.totalSaidas)}
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full w-fit">
               <span>-2.4%</span>
               <span className="text-gray-400 font-medium">desde abr</span>
            </div>
          </div>
        </div>

        {/* Saldo Card */}
        <div className="relative overflow-hidden group bg-blue-600 dark:bg-blue-900 rounded-4xl p-8 shadow-2xl shadow-blue-500/30 transition-all duration-500 hover:shadow-blue-500/50 hover:-translate-y-1">
          <div className="absolute -bottom-4 -right-4 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500 text-white">
             <DollarSign className="w-40 h-40" />
          </div>
          <div className="relative z-10 flex flex-col h-full text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-100">Saldo Atualizado</span>
            </div>
            <p className="text-4xl font-black tracking-tighter mb-4">
              {formatCurrency(finances.saldoAtual)}
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 w-fit">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
               <span className="text-white">Relatórios em tempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 p-8 lg:col-span-2 shadow-sm transition duration-300">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Fluxo de Caixa (2024)</h3>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div> Entradas
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                   <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div> Saídas
                </div>
             </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#111827',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="entradas" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorEntradas)" name="Entradas" />
                <Area type="monotone" dataKey="saidas" stroke="#94A3B8" strokeWidth={2} fillOpacity={0} name="Saídas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm transition duration-300">
          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-8">Fontes de Entrada</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#111827',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
             {pieData.map((entry, index) => (
               <div key={entry.name} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{entry.name}</span>
                 </div>
                 <span className="text-xs font-black text-gray-900 dark:text-white tracking-widest">{formatCurrency(entry.value)}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
