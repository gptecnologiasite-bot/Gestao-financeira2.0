/* eslint react-refresh/only-export-components: off */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Lista de usuários simulando DB
  const [dbUsers, setDbUsers] = useState(() => {
    const saved = localStorage.getItem('igreja_db_users');
    let users = [];
    
    if (saved) {
      try {
        users = JSON.parse(saved);
      } catch (e) {
        users = [];
      }
    }

    // Se não houver usuários, usa os padrões
    if (users.length === 0) {
      users = [
        { 
          id: '1', 
          nome: 'Administrador Bio', 
          email: 'admin@igreja.com', 
          password: 'aelda@800', 
          role: 'ADMIN', 
          status: 'ACTIVE', 
          foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          permissoes: { dashboard: true, financeiro: 'edit', membros: true, visitantes: true, ministerios: true, patrimonio: true, relatorios: true, portal: true, paginas: true }
        },
        { 
          id: '2', 
          nome: 'Joaquim Souza', 
          email: 'joaquim@igreja.com', 
          password: 'user123', 
          role: 'USER', 
          status: 'ACTIVE', 
          foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
          permissoes: { dashboard: true, financeiro: 'view', membros: true, visitantes: false, ministerios: false, patrimonio: false, relatorios: false, portal: false, paginas: false }
        },
      ];
    } else {
      // Forçar atualização da senha do admin se ele existir
      users = users.map(u => 
        u.id === '1' && u.email === 'admin@igreja.com' ? { ...u, password: 'aelda@800' } : u
      );
    }
    
    return users;
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
        let found = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        // Fail-safe para o administrador principal solicitado pelo usuário
        if (!found && email.toLowerCase() === 'admin@igreja.com' && password === 'aelda@800') {
          found = dbUsers.find(u => u.id === '1' || u.email.toLowerCase() === 'admin@igreja.com');
          if (found) {
            // Se encontrou o usuário mas a senha estava errada no localStorage, loga mesmo assim com a nova senha
            setUser(found);
            localStorage.setItem('auth_user', JSON.stringify(found));
            resolve(found);
            setLoading(false);
            return;
          }
        }

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
        const exists = dbUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (exists) {
          reject(new Error('Este e-mail já está cadastrado.'));
          setLoading(false);
          return;
        }

        const newUser = {
          ...userData,
          id: Date.now().toString(),
          status: userData.role === 'ADMIN' ? 'PENDING' : 'ACTIVE',
          permissoes: userData.role === 'ADMIN' ? { dashboard: true, financeiro: 'edit', membros: true, visitantes: true, ministerios: true, patrimonio: true, relatorios: true, portal: true, paginas: true } : { dashboard: true, financeiro: 'view', membros: true, portal: false, paginas: false }
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
