'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RecoverPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="p-8 bg-white border border-neutral-200 rounded-2xl shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-black text-white mx-auto flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-900">Acesso Restrito do Proprietário</h1>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Por motivos de segurança, a redefinição de acesso é restrita ao administrador e proprietário da Chote Store.
          </p>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center space-y-1 text-xs text-neutral-600">
          <p>Caso tenha esquecido as credenciais, verifique seu arquivo seguro de configuração ou suporte interno.</p>
        </div>

        <Link
          href="/login"
          className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
        >
          Voltar para o Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
