import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import GlobalStoreSync from '@/components/GlobalStoreSync';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CHOTE KITS | Loja de Camisas de Futebol Premium',
  description: 'Loja especializada na venda de camisas oficiais e retrô dos maiores clubes e seleções do futebol mundial com controle rigoroso de estoque.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#111111] antialiased">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <GlobalStoreSync />
              <Navbar />
              <main className="flex-1">{children}</main>
              <CartDrawer />
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

