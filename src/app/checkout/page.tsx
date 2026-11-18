'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle,
  Truck,
  ArrowRight,
  Lock,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatCPF, formatPhone, formatCEP } from '@/lib/formatters';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, total, coupon, clearCart } = useCart();
  const { user } = useAuth();

  // Customer Form
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'>('PIX');
  const [creditCardData, setCreditCardData] = useState({
    cardNumber: '',
    holderName: '',
    expiry: '',
    cvv: '',
    installments: '1',
  });

  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill logged in user info
  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
        cpf: prev.cpf || user.cpf || '',
      }));
    }
  }, [user]);

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0) {
      router.push('/carrinho');
    }
  }, [items, router]);

  // ViaCEP auto-lookup
  const handleCepChange = async (val: string) => {
    const formatted = formatCEP(val);
    const clean = val.replace(/\D/g, '');
    setCustomer((prev) => ({ ...prev, zipCode: formatted }));

    if (clean.length === 8) {
      setLoadingCep(true);
      setErrorMsg('');
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCustomer((prev) => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));

          // Fetch shipping options
          const shipRes = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cep: clean, subtotal }),
          });
          const shipData = await shipRes.json();
          if (shipData.options) {
            setShippingOptions(shipData.options);
            setSelectedShipping(shipData.options[0]);
          }
        } else {
          setErrorMsg('CEP não localizado pelos Correios.');
        }
      } catch {
        setErrorMsg('Erro ao consultar CEP.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!customer.name || !customer.email || !customer.phone || !customer.cpf) {
      setErrorMsg('Preencha todos os dados pessoais do cliente.');
      return;
    }

    if (!customer.zipCode || !customer.street || !customer.number || !customer.city || !customer.state) {
      setErrorMsg('Preencha todos os campos do endereço de entrega.');
      return;
    }

    if (paymentMethod === 'CREDIT_CARD') {
      if (!creditCardData.cardNumber || !creditCardData.holderName || !creditCardData.expiry || !creditCardData.cvv) {
        setErrorMsg('Preencha os dados do cartão de crédito para pagamento seguro.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          paymentMethod,
          shippingOption: selectedShipping,
          couponCode: coupon?.code || null,
          notes: paymentMethod === 'CREDIT_CARD' ? `Cartão em ${creditCardData.installments}x` : 'Pagamento via PIX instantâneo',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pedido.');
      }

      // Order created successfully! Clear cart & redirect
      clearCart();
      const orderNum = encodeURIComponent(data.order.orderNumber.replace('#', ''));
      router.push(`/pedido/${orderNum}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao finalizar compra.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-6 border-b border-neutral-200">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Etapa 2 de 2</span>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Finalização da Compra</h1>
        <p className="text-xs text-neutral-500 mt-1">Ambiente seguro com reserva imediata de estoque</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8">
        {/* Left 2 Cols: Customer Data, Address, Payment */}
        <div className="lg:col-span-2 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Identification */}
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">1</span>
              Dados do Comprador
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Ex: Gabriel Silva"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: formatPhone(e.target.value) })}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">CPF *</label>
                <input
                  type="text"
                  required
                  value={customer.cpf}
                  onChange={(e) => setCustomer({ ...customer, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Endereço de Entrega
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  CEP * {loadingCep && <span className="text-neutral-400 font-normal">(buscando...)</span>}
                </label>
                <input
                  type="text"
                  required
                  value={customer.zipCode}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Rua / Logradouro *</label>
                <input
                  type="text"
                  required
                  value={customer.street}
                  onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                  placeholder="Avenida Paulista"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Número *</label>
                <input
                  type="text"
                  required
                  value={customer.number}
                  onChange={(e) => setCustomer({ ...customer, number: e.target.value })}
                  placeholder="1578"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Complemento</label>
                <input
                  type="text"
                  value={customer.complement}
                  onChange={(e) => setCustomer({ ...customer, complement: e.target.value })}
                  placeholder="Apto 102, Bloco B"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  required
                  value={customer.neighborhood}
                  onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                  placeholder="Bela Vista"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Cidade *</label>
                <input
                  type="text"
                  required
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Estado (UF) *</label>
                <input
                  type="text"
                  required
                  value={customer.state}
                  onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black uppercase font-semibold"
                />
              </div>
            </div>

            {/* Shipping Mode Selector */}
            {shippingOptions.length > 0 && (
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <label className="block text-xs font-semibold text-neutral-900">Modalidade de Envio:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        selectedShipping?.id === opt.id
                          ? 'border-black bg-neutral-50 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="shipping_opt"
                          checked={selectedShipping?.id === opt.id}
                          onChange={() => setSelectedShipping(opt)}
                          className="accent-black"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{opt.name}</p>
                          <p className="text-[11px] text-neutral-500">{opt.days}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-neutral-900">
                        {opt.price === 0 ? <span className="text-emerald-700">GRÁTIS</span> : formatCurrency(opt.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">3</span>
              Forma de Pagamento
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'PIX'
                    ? 'border-black bg-neutral-900 text-white shadow-md'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1.5" />
                <span className="text-xs font-bold block">PIX</span>
                <span className="text-[10px] opacity-80 block">Aprovação Imediata</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-black bg-neutral-900 text-white shadow-md'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1.5" />
                <span className="text-xs font-bold block">Cartão de Crédito</span>
                <span className="text-[10px] opacity-80 block">Até 10x sem juros</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT_CARD')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  paymentMethod === 'DEBIT_CARD'
                    ? 'border-black bg-neutral-900 text-white shadow-md'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1.5" />
                <span className="text-xs font-bold block">Débito Online</span>
                <span className="text-[10px] opacity-80 block">À vista</span>
              </button>
            </div>

            {/* PIX Details */}
            {paymentMethod === 'PIX' && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Pagamento com Aprovação Instantânea
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Ao clicar em &quot;Confirmar Pedido&quot;, o QR Code oficial do PIX e a chave copia-e-cola serão gerados imediatamente na tela para você pagar pelo app do seu banco.
                </p>
              </div>
            )}

            {/* Credit Card Form */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={creditCardData.cardNumber}
                      onChange={(e) => setCreditCardData({ ...creditCardData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      placeholder="GABRIEL F SILVA"
                      value={creditCardData.holderName}
                      onChange={(e) => setCreditCardData({ ...creditCardData, holderName: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black uppercase bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Validade (MM/AA)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      maxLength={5}
                      value={creditCardData.expiry}
                      onChange={(e) => setCreditCardData({ ...creditCardData, expiry: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">CVV (Cód. Segurança)</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={creditCardData.cvv}
                      onChange={(e) => setCreditCardData({ ...creditCardData, cvv: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Parcelamento</label>
                    <select
                      value={creditCardData.installments}
                      onChange={(e) => setCreditCardData({ ...creditCardData, installments: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                    >
                      <option value="1">1x de {formatCurrency(total)} (à vista)</option>
                      <option value="2">2x de {formatCurrency(total / 2)} sem juros</option>
                      <option value="3">3x de {formatCurrency(total / 3)} sem juros</option>
                      <option value="6">6x de {formatCurrency(total / 6)} sem juros</option>
                      <option value="10">10x de {formatCurrency(total / 10)} sem juros</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Itens do Pedido ({items.length})
            </h3>

            <div className="divide-y divide-neutral-200 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="py-3 flex gap-3 items-center">
                  <div className="relative w-12 h-14 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-neutral-500">Tam: {item.size} • Qtd: {item.quantity}</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">{formatCurrency(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto ({coupon?.code})</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-semibold text-neutral-900">
                  {selectedShipping?.price === 0 || subtotal >= 399
                    ? <span className="text-emerald-700">GRÁTIS</span>
                    : formatCurrency(selectedShipping?.price || shipping)}
                </span>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-neutral-900">Total a Pagar</span>
                <span className="text-2xl font-black text-neutral-900">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-xl"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Confirmando Pedido...' : 'Confirmar Pedido'}
            </button>

            <div className="p-3 bg-neutral-100/80 border border-neutral-200 rounded-xl space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-neutral-900">
                <Lock className="w-3.5 h-3.5 text-neutral-800" />
                <span>Ambiente Criptografado & Seguro (SSL 256-bits)</span>
              </div>
              <p className="text-[10px] text-neutral-500">
                Proteção ponta a ponta e baixa de estoque imediata no sistema.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

