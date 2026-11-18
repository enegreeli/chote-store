'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Truck, RotateCcw, CreditCard, MessageCircle, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer inside admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#111111] text-neutral-300 border-t border-neutral-800">
      {/* Benefit Highlights */}
      <div className="border-b border-neutral-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Frete Grátis Brasil</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Em compras acima de R$ 399 com rastreamento.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Autenticidade Garantida</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Tecidos oficiais de alta tecnologia e acabamento.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Troca Descomplicada</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Até 30 dias após o recebimento sem custos.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Até 10x Sem Juros</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Ou 5% de desconto à vista via PIX.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & About */}
        <div className="space-y-4">
          <Link href="/" className="flex flex-col items-start">
            <span className="text-2xl font-black tracking-tighter text-white">
              CHOTE<span className="text-neutral-500">.</span>STORE
            </span>
            <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-500 uppercase -mt-1">
              Grifes & Sportswear
            </span>
          </Link>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sua boutique definitiva de grifes exclusivas, streetwear contemporâneo e camisas de futebol para torcedores e colecionadores. Estilo, autenticidade e padrão internacional.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://wa.me/5511998765432"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="mailto:contato@chotestore.com"
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Categorias */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Coleções & Categorias</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/produtos?category=grifes-luxo" className="hover:text-white transition-colors">
                Grifes de Luxo (Lacoste, Boss, Lauren)
              </Link>
            </li>
            <li>
              <Link href="/produtos?category=streetwear" className="hover:text-white transition-colors">
                Streetwear Premium
              </Link>
            </li>
            <li>
              <Link href="/produtos?category=times-internacionais" className="hover:text-white transition-colors">
                Times Internacionais
              </Link>
            </li>
            <li>
              <Link href="/produtos?category=times-nacionais" className="hover:text-white transition-colors">
                Times Brasileiros
              </Link>
            </li>
            <li>
              <Link href="/produtos?category=camisetas-polo" className="hover:text-white transition-colors">
                Camisas Polo
              </Link>
            </li>
            <li>
              <Link href="/produtos?category=camisetas-casuais" className="hover:text-white transition-colors">
                Camisetas Casuais
              </Link>
            </li>
            <li>
              <Link href="/produtos?category=camisas-retro" className="hover:text-white transition-colors">
                Camisas Retrô Históricas
              </Link>
            </li>
            <li>
              <Link href="/produtos?modelType=JOGADOR" className="hover:text-white transition-colors">
                Versão Jogador (Authentic)
              </Link>
            </li>
            <li>
              <Link href="/produtos?promo=true" className="hover:text-white transition-colors">
                Ofertas & Promoções
              </Link>
            </li>
          </ul>
        </div>

        {/* Ajuda & Suporte */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Atendimento & Ajuda</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/rastreamento" className="hover:text-white transition-colors">
                Rastrear Pedido
              </Link>
            </li>
            <li>
              <Link href="/minha-conta" className="hover:text-white transition-colors">
                Meus Pedidos
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors">
                Minha Conta
              </Link>
            </li>
            <li>
              <span className="text-neutral-500 cursor-default">Política de Trocas e Devoluções</span>
            </li>
            <li>
              <span className="text-neutral-500 cursor-default">Termos de Serviço & Privacidade</span>
            </li>
            <li>
              <Link href="/admin" className="text-neutral-500 hover:text-white transition-colors">
                Acesso do Lojista (Painel Admin)
              </Link>
            </li>
          </ul>
        </div>

        {/* Informações da Loja */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Informações de Contato</h4>
          <div className="space-y-3 text-xs text-neutral-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
              <span>Av. Paulista, 1578 - Bela Vista, São Paulo - SP</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span>WhatsApp: (11) 99876-5432</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span>contato@chotestore.com</span>
            </div>
            <div className="pt-2">
              <p className="text-[11px] text-neutral-500">Horário de Atendimento:</p>
              <p className="text-xs text-neutral-300">Segunda a Sábado, das 09h às 19h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-900 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} CHOTE STORE. Todos os direitos reservados. CNPJ: 45.123.987/0001-00.</p>
        <p className="mt-1 text-[11px] text-neutral-600">
          Plataforma de E-commerce com Controle de Estoque Integrado e Criptografia SSL/TLS de Ponta a Ponta.
        </p>
      </div>
    </footer>
  );
}

