/* eslint react-refresh/only-export-components: off */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Lista de usuários simulando DB
  const [dbUsers, setDbUsers] = useState(() => {
    const saved = localStorage.getItem('igreja_db_users');
    if (saved) return JSON.parse(saved);
    // Usuários padrão iniciais
    return [
      { 
        id: '1', 
        nome: 'Administrador Bio', 
        email: 'admin@igreja.com', 
        password: 'admin123', 
        role: 'ADMIN', 
        status: 'ACTIVE', 
        foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        permissoes: { dashboard: true, financeiro: 'edit', membros: true, visitantes: true, ministerios: true, patrimonio: true, relatorios: true, portal: true }
      },
    { 
      id: '2', 
      nome: 'Joaquim Souza', 
      email: 'joaquim@igreja.com', 
      password: 'user123', 
      role: 'USER', 
      status: 'ACTIVE', 
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      permissoes: { dashboard: true, financeiro: 'view', membros: true, visitantes: false, ministerios: false, patrimonio: false, relatorios: false, portal: false }
    },
    ];
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  // Persistir DB mockado
  useEffect(() => {
    localStorage.setItem('igreja_db_users', JSON.stringify(dbUsers));
  }, [dbUsers]);

  const login = async (email, password) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = dbUsers.find(u => u.email === email && u.password === password);
        if (found) {
          if (found.status === 'PENDING') {
            reject(new Error('Sua conta está aguardando liberação do administrador.'));
          } else {
            if (found.status === 'INACTIVE') {
      reject(new Error('Sua conta está desativada. Entre em contato com o administrador.'));
    }
    setUser(found);
            localStorage.setItem('auth_user', JSON.stringify(found));
            resolve(found);
          }
        } else {
          reject(new Error('E-mail ou senha incorretos.'));
        }
        setLoading(false);
      }, 800);
    });
  };

  const register = async (userData) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = dbUsers.find(u => u.email === userData.email);
        if (exists) {
          reject(new Error('Este e-mail já está cadastrado.'));
          setLoading(false);
          return;
        }

        const newUser = {
          ...userData,
          id: Date.now().toString(),
          status: userData.role === 'ADMIN' ? 'PENDING' : 'ACTIVE',
          permissoes: userData.role === 'ADMIN' ? { dashboard: true, financeiro: 'edit', membros: true, visitantes: true, ministerios: true, patrimonio: true, relatorios: true, portal: true } : { dashboard: true, financeiro: 'view', membros: true, portal: false }
        };

        setDbUsers(prev => [...prev, newUser]);
        resolve(newUser);
        setLoading(false);
      }, 1000);
    });
  };

  const updateUserInfo = (updatedUser) => {
    setDbUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // Se for o usuário logado, atualiza o session storage
    if (user?.id === updatedUser.id) {
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAdmin, loading, dbUsers, setDbUsers, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
