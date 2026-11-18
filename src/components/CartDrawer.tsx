'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/formatters';

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 399;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-neutral-900">
                Seu Carrinho ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          <div className="bg-neutral-50 p-3 border-b border-neutral-100">
            {missingForFreeShipping === 0 ? (
              <p className="text-xs font-semibold text-emerald-700 text-center">
                🎉 Parabéns! Você ganhou <span className="font-bold">Frete Grátis</span>!
              </p>
            ) : (
              <p className="text-xs text-neutral-600 text-center">
                Adicione mais <span className="font-bold text-neutral-900">{formatCurrency(missingForFreeShipping)}</span> para ganhar <span className="font-bold text-neutral-900">Frete Grátis</span>
              </p>
            )}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-neutral-950 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mb-3" />
                <p className="text-base font-semibold text-neutral-800">Seu carrinho está vazio</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Explore nossas coleções de grifes de luxo, streetwear e mantos oficiais e escolha seus favoritos.
                </p>
                <Link
                  href="/produtos"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Ver Catálogo
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="py-4 flex gap-3">
                  <div className="w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="inline-block mt-0.5 px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase rounded">
                        Tamanho: {item.size}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-1 text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-neutral-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-neutral-900">Total Estimado</span>
                  <p className="text-[10px] text-neutral-400">Frete calculado no checkout</p>
                </div>
                <span className="text-base font-black text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/carrinho"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 px-4 border border-neutral-300 text-neutral-800 rounded-lg text-xs font-bold uppercase tracking-wider text-center hover:bg-neutral-100 transition-colors"
                >
                  Ver Carrinho
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 px-4 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider text-center hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                >
                  Finalizar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

