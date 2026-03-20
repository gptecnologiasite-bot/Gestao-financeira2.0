import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { Church, Mail, Lock, Loader2, AlertCircle, UserPlus, Shield, User } from 'lucide-react';

export default function Registro() {
  const { branding } = useBranding();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestAdmin, setRequestAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [foto, setFoto] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const AVATARES = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        nome,
        email,
        password,
        foto,
        role: requestAdmin ? 'ADMIN' : 'USER'
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in duration-500">
           <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Church className="h-10 w-10 text-green-600 dark:text-green-400" />
           </div>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Conta Criada!</h2>
           <p className="text-gray-500 dark:text-gray-400 font-medium">
             Seu cadastro foi realizado com sucesso. 
             {requestAdmin && <span className="block mt-2 font-bold text-blue-600">Aguarde a liberação do administrador para acessar o painel.</span>}
           </p>
           <p className="text-xs text-gray-400">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-4xl shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl p-2 border border-blue-50 dark:border-gray-700 overflow-hidden group hover:scale-105 transition-transform duration-500">
             <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{branding.title}</h2>
          <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">
            Crie sua conta para gerenciar a igreja
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Avatar Selector */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-blue-500 to-indigo-600 p-1 shadow-2xl transition-transform group-hover:scale-105">
                <img src={foto} alt="Avatar" className="w-full h-full rounded-[1.4rem] object-cover border-4 border-white dark:border-gray-900 shadow-inner" />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-gray-900">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
               {AVATARES.map((av, idx) => (
                 <button 
                   key={idx}
                   type="button"
                   onClick={() => setFoto(av)}
                   className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${foto === av ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                 >
                   <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Escolha sua foto</span>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold animate-in shake duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Nome Completo</label>
              <input
                type="text"
                required
                className="block w-full px-5 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">E-mail de Acesso</label>
              <input
                type="email"
                required
                className="block w-full px-5 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                placeholder="igreja@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">Senha Segura</label>
              <input
                type="password"
                required
                className="block w-full px-5 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 group cursor-pointer transition-all hover:bg-white dark:hover:bg-gray-700 shadow-inner" onClick={() => setRequestAdmin(!requestAdmin)}>
             <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${requestAdmin ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <Shield className="w-3.5 h-3.5" />
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Solicitar Perfil Admin</span>
                <span className="text-[10px] font-medium text-gray-400">Requer liberação da tesouraria</span>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-blue-500/20 text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="text-center">
            <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
               Já tem uma conta? <span className="text-blue-600 underline">Acessar Login</span>
            </Link>
        </div>
      </div>
    </div>
  );
}
