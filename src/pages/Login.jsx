import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-4xl shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl p-2 border border-blue-50 dark:border-gray-700 overflow-hidden group hover:scale-105 transition-transform duration-500">
             <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{branding.title}</h2>
          <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">
            Acesse sua conta para gerenciar
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="admin@igreja.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-400 cursor-pointer">
                Lembrar de mim
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu a senha?
              </a>
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
            {loading ? 'Acessando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="space-y-4 pt-2">
          <Link
            to="/portal-transparencia"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center py-4 px-4 border border-blue-200 dark:border-blue-700 rounded-2xl text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-all active:scale-95"
          >
            Portal da Transparência
          </Link>

          <div className="text-center">
              <Link to="/registro" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
                 Não possui uma conta? <span className="text-blue-600 underline">Cadastre-se aqui</span>
              </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-8">
           &copy; {new Date().getFullYear()} Igreja - Sistema de Gestão Financeira.
        </p>
      </div>
    </div>
  );
}
