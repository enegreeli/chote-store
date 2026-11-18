'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/formatters';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);
    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);

    if (res.success) {
      setCouponMessage({ text: res.message, error: false });
      setCouponInput('');
    } else {
      setCouponMessage({ text: res.message, error: true });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto p-10 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
          <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto text-neutral-600">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight">Seu Carrinho está Vazio</h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Nenhum produto selecionado ainda. Explore nossas grifes de luxo, streetwear, polos e mantos de futebol e adicione seus favoritos.
          </p>
          <div className="pt-2">
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Explorar Catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-6 border-b border-neutral-200">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Etapa 1 de 2</span>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Carrinho de Compras</h1>
        <p className="text-xs text-neutral-500 mt-1">{itemCount} item(ns) no seu pedido</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8">
        {/* Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                <div className="relative w-20 sm:w-24 aspect-[4/5] bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/produto/${item.slug}`}
                        className="text-sm font-bold text-neutral-900 hover:underline line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded">
                          Tamanho: {item.size}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {formatCurrency(item.unitPrice)} cada
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remover produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-neutral-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="p-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-neutral-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/produtos"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
            >
              ← Continuar Comprando
            </Link>
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Esvaziar Carrinho
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Resumo do Pedido
            </h3>

            {/* Coupon Box */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-500" /> Possui um cupom de desconto?
              </span>

              {coupon ? (
                <div className="p-3 bg-white rounded-lg border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900 uppercase">{coupon.code}</p>
                      <p className="text-[11px] text-emerald-700">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}% de desconto aplicado`
                          : coupon.discountType === 'FIXED'
                          ? `R$ ${coupon.discountValue.toFixed(2)} de desconto aplicado`
                          : 'Frete Grátis aplicado'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Ex: BEMVINDO10"
                    className="flex-1 px-3 py-2 text-xs font-semibold uppercase bg-white border border-neutral-300 rounded-lg outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </form>
              )}

              {couponMessage && (
                <p className={`text-xs ${couponMessage.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal dos produtos</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto cupom</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-semibold text-neutral-900">
                  {subtotal >= 399 ? (
                    <span className="text-emerald-700">GRÁTIS</span>
                  ) : shipping > 0 ? (
                    formatCurrency(shipping)
                  ) : (
                    'Calculado no checkout'
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-neutral-900">Valor Total</span>
                <span className="text-2xl font-black text-neutral-900">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Prosseguir para Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Ambiente de pagamento seguro com criptografia 256-bit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

