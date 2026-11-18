'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight, AlertCircle } from 'lucide-react';

export default function TrackingSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Por favor, informe o número do pedido ou seu CPF.');
      return;
    }

    const clean = query.trim().replace('#', '');
    router.push(`/pedido/${clean}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="p-8 bg-white border border-neutral-200 rounded-2xl shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-neutral-100 text-neutral-800 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Autoatendimento</span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
            Rastrear Pedido
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Consulte o status do seu pedido em tempo real, etapas de preparação e código de rastreio Correios.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError('');
              }}
              placeholder="Digite o número do pedido (ex: CT-1001)"
              className="w-full px-4 py-3 text-xs font-semibold border border-neutral-300 rounded-xl outline-none focus:border-black pl-10"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            Consultar Status <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

