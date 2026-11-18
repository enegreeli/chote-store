'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  cpf?: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; cpf?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refresh: async () => {},
  isAdmin: false,
  isStaff: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Credenciais inválidas' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Falha de conexão. Tente novamente.' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string; cpf?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao criar conta' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Falha de conexão. Tente novamente.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch {
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'GERENTE';
  const isStaff = user?.role === 'ADMIN' || user?.role === 'GERENTE' || user?.role === 'FUNCIONARIO';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        isAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

