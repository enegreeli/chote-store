'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: 'CHOTE KITS',
    store_tagline: 'Loja Oficial de Mantos & Camisas de Futebol Premium',
    whatsapp_number: '5511998765432',
    instagram_handle: '@chotestore.oficial',
    contact_email: 'contato@chotestore.com',
    store_address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
    banner_title: 'TEMPORADA 2024/2025',
    banner_subtitle: 'Mantos oficiais dos maiores clubes do mundo com tecnologia de ponta e acabamento premium.',
    banner_image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600',
    exchange_policy: 'Prazo de troca de até 30 dias corridos após o recebimento. O produto deve estar sem marcas de uso, com etiquetas intactas e na embalagem original.',
    privacy_policy: 'Seus dados pessoais são protegidos com criptografia de ponta a ponta e nunca serão compartilhados com terceiros.',
    terms_of_use: 'Todas as transações são intermediadas com segurança criptográfica. Enviamos código de rastreamento em até 24h úteis.',
    free_shipping_threshold: '399.00',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar configurações');
      }

      setFeedback({ text: 'Configurações da loja salvas com sucesso no banco de dados!', error: false });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ text: err.message || 'Erro ao salvar', error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-neutral-500">Carregando configurações...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Customização Global</span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Configurações da Loja</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Altere dados de contato, WhatsApp, banners, políticas e frete sem precisar tocar no código-fonte.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.error ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {feedback.error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Contact */}
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            1. Identidade & Contatos Oficiais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome da Loja</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={settings.store_tagline}
                onChange={(e) => handleChange('store_tagline', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">WhatsApp de Vendas</label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="5511999999999"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Instagram Oficial</label>
              <input
                type="text"
                value={settings.instagram_handle}
                onChange={(e) => handleChange('instagram_handle', e.target.value)}
                placeholder="@chotestore.oficial"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail de Suporte</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Valor Mínimo para Frete Grátis (R$)</label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Endereço Físico / Sede</label>
              <input
                type="text"
                value={settings.store_address}
                onChange={(e) => handleChange('store_address', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Hero Banner Customization */}
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            2. Banner Principal da Página Inicial
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Título do Banner</label>
              <input
                type="text"
                value={settings.banner_title}
                onChange={(e) => handleChange('banner_title', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Subtítulo / Descrição</label>
              <textarea
                rows={2}
                value={settings.banner_subtitle}
                onChange={(e) => handleChange('banner_subtitle', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">URL da Imagem de Fundo</label>
              <input
                type="url"
                value={settings.banner_image_url}
                onChange={(e) => handleChange('banner_image_url', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-mono"
              />
            </div>
          </div>
        </div>

        {/* Institutional Policies */}
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            3. Políticas Institucionais da Loja
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Política de Trocas e Devoluções</label>
              <textarea
                rows={3}
                value={settings.exchange_policy}
                onChange={(e) => handleChange('exchange_policy', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Política de Privacidade & Segurança</label>
              <textarea
                rows={3}
                value={settings.privacy_policy}
                onChange={(e) => handleChange('privacy_policy', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Termos de Uso do Serviço</label>
              <textarea
                rows={3}
                value={settings.terms_of_use}
                onChange={(e) => handleChange('terms_of_use', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Gravando no Banco...' : 'Salvar Todas as Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}

