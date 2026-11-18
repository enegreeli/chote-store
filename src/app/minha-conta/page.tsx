'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Heart,
  MapPin,
  User,
  LogOut,
  ChevronRight,
  Package,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency, formatDate, ORDER_STATUS_MAP } from '@/lib/formatters';
import ProductCard from '@/components/ProductCard';

function CustomerAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const { user, loading: authLoading, logout } = useAuth();
  const { wishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load orders
  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  // Load wishlist products
  useEffect(() => {
    if (wishlist.length > 0) {
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            setWishlistProducts(data.products.filter((p: any) => wishlist.includes(p.id)));
          }
        })
        .catch(console.error);
    } else {
      setWishlistProducts([]);
    }
  }, [wishlist]);

  if (authLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-neutral-500">
        Carregando sua conta...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="p-6 bg-white border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-neutral-900 text-white font-black text-xl flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight">{user.name}</h1>
            <p className="text-xs text-neutral-500">{user.email} • {user.phone || 'Sem telefone'}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white">
              {user.role === 'ADMIN' ? 'Administrador da Loja' : 'Conta Registrada'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Acessar Painel Admin
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair da Conta
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <aside className="space-y-1">
          {[
            { id: 'orders', label: 'Meus Pedidos', icon: ShoppingBag, count: orders.length },
            { id: 'wishlist', label: 'Lista de Desejos', icon: Heart, count: wishlist.length },
            { id: 'profile', label: 'Dados Pessoais', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Tab Content */}
        <main className="md:col-span-3">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
                Histórico de Pedidos Realizados
              </h2>

              {loadingOrders ? (
                <div className="p-8 text-center text-xs text-neutral-500">Buscando seus pedidos...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                  <Package className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-800">Você ainda não realizou nenhum pedido</p>
                  <p className="text-xs text-neutral-500 mt-1">Conheça nossos lançamentos e faça sua primeira compra.</p>
                  <Link
                    href="/produtos"
                    className="mt-4 inline-block px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                  >
                    Ver Catálogo
                  </Link>
                </div>
              ) : (
                orders.map((ord) => {
                  const statusInfo = ORDER_STATUS_MAP[ord.status] || {
                    label: ord.status,
                    bg: 'bg-neutral-100',
                    color: 'text-neutral-800',
                  };

                  return (
                    <div
                      key={ord.id}
                      className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-sm hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                        <div>
                          <span className="text-xs font-black text-neutral-900">{ord.orderNumber}</span>
                          <span className="text-xs text-neutral-400 ml-2">
                            • {formatDate(ord.createdAt)}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold w-fit ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="divide-y divide-neutral-50">
                        {ord.items?.map((it: any) => (
                          <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                            <span className="font-medium text-neutral-800">
                              {it.quantity}x {it.productName} (Tam: {it.size})
                            </span>
                            <span className="font-bold text-neutral-900">
                              {formatCurrency(it.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <div>
                          <span className="text-[11px] text-neutral-400">Total Pago:</span>{' '}
                          <span className="text-sm font-black text-neutral-900">{formatCurrency(ord.total)}</span>
                        </div>

                        <Link
                          href={`/pedido/${ord.orderNumber.replace('#', '')}`}
                          className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1"
                        >
                          Ver Detalhes & Rastreio <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
                Meus Mantos Favoritos
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                  <Heart className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-800">Sua lista de favoritos está vazia</p>
                  <p className="text-xs text-neutral-500 mt-1">Clique no ícone de coração nos mantos que você deseja salvar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Dados Cadastrais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-medium">Nome</span>
                  <span className="font-bold text-neutral-900 text-sm">{user.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">E-mail</span>
                  <span className="font-bold text-neutral-900 text-sm">{user.email}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Telefone</span>
                  <span className="font-bold text-neutral-900 text-sm">{user.phone || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">CPF</span>
                  <span className="font-bold text-neutral-900 text-sm">{user.cpf || 'Não informado'}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-500">Carregando conta...</div>}>
      <CustomerAccountContent />
    </Suspense>
  );
}

