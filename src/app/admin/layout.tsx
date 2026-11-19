'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  History,
  ShoppingBag,
  PlusCircle,
  DollarSign,
  Users,
  Tag,
  FolderTree,
  FileBarChart,
  Settings,
  ExternalLink,
  LogOut,
  AlertTriangle,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminAutoSync from '@/components/AdminAutoSync';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isStaff, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isStaff)) {
      router.push('/login');
    }
  }, [user, isStaff, loading, router]);

  // Check low stock count for alert badge
  useEffect(() => {
    if (isStaff) {
      fetch('/api/admin/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data.kpis?.lowStockCount !== undefined) {
            setLowStockCount(data.kpis.lowStockCount);
          }
        })
        .catch(() => {});
    }
  }, [isStaff]);

  if (loading || !user || !isStaff) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white text-xs font-semibold">
        Verificando permissões administrativas...
      </div>
    );
  }

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Gestão de Estoque',
      items: [
        { label: 'Controle de Estoque', href: '/admin/estoque', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} alertas` : null },
        { label: 'Movimentações', href: '/admin/estoque/movimentacoes', icon: History },
      ],
    },
    {
      title: 'Catálogo & Vendas',
      items: [
        { label: 'Produtos', href: '/admin/produtos', icon: ShoppingBag },
        { label: 'Pedidos de Venda', href: '/admin/pedidos', icon: ShoppingBag },
        { label: 'Venda Manual', href: '/admin/pedidos/novo-manual', icon: PlusCircle },
        { label: 'Categorias', href: '/admin/categorias', icon: FolderTree },
      ],
    },
    {
      title: 'Financeiro & Promoções',
      items: [
        { label: 'Controle Financeiro', href: '/admin/financeiro', icon: DollarSign },
        { label: 'Cupons e Promoções', href: '/admin/cupons', icon: Tag },
      ],
    },
    {
      title: 'Análise & Sistema',
      items: [
        { label: 'Relatórios & Exportação', href: '/admin/relatorios', icon: FileBarChart },
        { label: 'Configurações da Loja', href: '/admin/configuracoes', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111111] text-neutral-300 border-r border-neutral-800">
      {/* Brand */}
      <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
        <Link href="/admin" className="flex flex-col items-start">
          <span className="text-lg font-black tracking-tighter text-white">
            CHOTE<span className="text-neutral-500">.</span>ADMIN
          </span>
          <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase -mt-0.5">
            Gestão & Estoque
          </span>
        </Link>
        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
          {user.role}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3">
              {sec.title}
            </span>
            <div className="space-y-0.5 pt-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-neutral-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            target="_blank"
            className="py-1.5 px-2 bg-neutral-900 text-neutral-300 hover:text-white rounded text-[11px] font-medium text-center flex items-center justify-center gap-1 border border-neutral-800 transition-colors"
            title="Abrir loja em nova aba"
          >
            Loja <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={logout}
            className="py-1.5 px-2 bg-neutral-900 text-rose-400 hover:text-rose-300 rounded text-[11px] font-medium text-center flex items-center justify-center gap-1 border border-neutral-800 transition-colors"
          >
            Sair <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-neutral-500 hidden sm:inline">
              Painel de Administração Chote Kits
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AdminAutoSync />

            {lowStockCount > 0 && (
              <Link
                href="/admin/estoque?filter=low"
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowStockCount} produto(s) com estoque baixo</span>
              </Link>
            )}

            <Link
              href="/"
              className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
            >
              Ver Loja Virtual <ExternalLink className="w-3 h-3 text-neutral-500" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

