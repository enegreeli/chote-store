'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.products) {
          setResults(data.products.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por produto, grife, clube ou estilo (ex: Lacoste, Real Madrid, Hugo Boss, Balenciaga)..."
            className="w-full text-base font-medium outline-none text-neutral-900 placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-neutral-500">Buscando no catálogo...</div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {results.map((product) => {
                const img = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
                const price = product.promoPrice || product.price;

                return (
                  <Link
                    key={product.id}
                    href={`/produto/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="w-14 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                        {product.brand || product.team || 'Grife'} {product.season ? `• ${product.season}` : ''}
                      </div>
                      <h4 className="text-sm font-medium text-neutral-900 truncate group-hover:text-black">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(price)}
                        </span>
                        {product.promoPrice && (
                          <span className="text-xs text-neutral-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                        {product.isOutOfStock && (
                          <span className="text-[10px] font-semibold uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                            Esgotado
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-600 font-medium">Nenhum produto encontrado para &quot;{query}&quot;</p>
              <p className="text-xs text-neutral-400 mt-1">Tente pesquisar por termos como marca, modelo ou clube.</p>
            </div>
          ) : (
            <div className="py-8 px-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Buscas Populares</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Lacoste', 'Real Madrid', 'Hugo Boss', 'Flamengo', 'Polo Ralph Lauren', 'Balenciaga', 'Retrô 1962', 'Manchester City'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
            <Link
              href={`/produtos?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:underline"
            >
              Ver todos os resultados para &quot;{query}&quot; →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

