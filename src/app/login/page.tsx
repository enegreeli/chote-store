'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="p-8 bg-white border border-neutral-200 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-black text-white mx-auto flex items-center justify-center mb-2 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Acesso Restrito
          </span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Login da Loja</h1>
          <p className="text-xs text-neutral-500">
            Painel administrativo e controle geral da Chote Store.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2.5 pl-9 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-medium"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pl-9 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-medium"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Entrando no Painel...' : 'Entrar no Painel da Loja'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
