'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  ShieldAlert,
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import SearchModal from './SearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isStaff, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // If in admin routes, don't show the storefront navbar
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Catálogo', href: '/produtos' },
    { name: 'Grifes', href: '/produtos?category=grifes-luxo' },
    { name: 'Streetwear', href: '/produtos?category=streetwear' },
    { name: 'Internacionais', href: '/produtos?category=times-internacionais' },
    { name: 'Nacionais', href: '/produtos?category=times-nacionais' },
    { name: 'Polos', href: '/produtos?category=camisetas-polo' },
    { name: 'Camisetas', href: '/produtos?category=camisetas-casuais' },
    { name: 'Retrô', href: '/produtos?category=camisas-retro' },
    { name: 'Ofertas', href: '/produtos?promo=true' },
  ];

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-[#111111] text-white text-[11px] font-medium tracking-wide py-2 px-4 text-center border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:inline text-neutral-400">
            GRIFES EXCLUSIVAS, STREETWEAR & MANTOS OFICIAIS
          </span>
          <div className="flex-1 text-center font-semibold">
            Frete Grátis acima de R$ 399 • 10% OFF no cupom <span className="text-white underline underline-offset-2">BEMVINDO10</span> • Até 10x Sem Juros
          </div>
          <span className="hidden md:inline text-neutral-400">
            ENVIAMOS PARA TODO O BRASIL
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex flex-col items-start group">
                <span className="text-2xl font-black tracking-tighter text-[#111111] group-hover:opacity-80 transition-opacity">
                  CHOTE<span className="text-neutral-400">.</span>STORE
                </span>
                <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase -mt-1">
                  Grifes & Sportswear
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-neutral-900 ${
                      isActive ? 'text-black border-b-2 border-black pb-1' : 'text-neutral-500'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions Icons */}
            <div className="flex items-center gap-3">
              {/* Admin quick toggle button if user has permissions */}
              {isStaff && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-sm"
                  title="Abrir Painel Administrativo"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Painel Admin</span>
                </Link>
              )}

              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
                title="Buscar produtos & grifes"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <Link
                href="/minha-conta?tab=wishlist"
                className="relative p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
                title="Favoritos"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
                title="Ver Carrinho"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Account Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-neutral-200 hover:border-black text-xs font-semibold text-neutral-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-500" />
                      <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                            {user.role}
                          </span>
                        </div>

                        {isStaff && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-neutral-700" />
                            Painel Administrativo
                          </Link>
                        )}

                        <Link
                          href="/minha-conta"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-neutral-500" />
                          Minha Conta
                        </Link>

                        <Link
                          href="/minha-conta?tab=orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-neutral-500" />
                          Meus Pedidos
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors border-t border-neutral-100 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Encerrar Sessão
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:border-black hover:bg-black hover:text-white transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Entrar</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-2 pb-6 space-y-3">
            {isStaff && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider"
              >
                <LayoutDashboard className="w-4 h-4" />
                Painel Administrativo
              </Link>
            )}
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 rounded-md"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/rastreamento"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-neutral-500 hover:bg-neutral-50 rounded-md"
              >
                Rastrear Meu Pedido
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

