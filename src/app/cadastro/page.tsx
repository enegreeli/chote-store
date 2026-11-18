'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to single store login
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="p-8 bg-white border border-neutral-200 rounded-2xl shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-xl bg-black text-white mx-auto flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-neutral-900">Acesso Simplificado da Loja</h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          A loja utiliza agora acesso unificado pelo painel administrativo. Redirecionando para o login...
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Ir para Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
