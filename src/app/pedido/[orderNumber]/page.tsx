'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  AlertTriangle,
  QrCode,
  Copy,
  Printer,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/lib/formatters';

const STATUS_STEPS = [
  { key: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pagamento', icon: Clock },
  { key: 'PAGAMENTO_APROVADO', label: 'Pagamento Aprovado', icon: CheckCircle2 },
  { key: 'EM_PREPARACAO', label: 'Em Preparação', icon: Package },
  { key: 'ENVIADO', label: 'Enviado', icon: Truck },
  { key: 'SAIU_PARA_ENTREGA', label: 'Saiu para Entrega', icon: Truck },
  { key: 'ENTREGUE', label: 'Entregue', icon: Home },
];

export default function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const { orderNumber } = params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-neutral-500 animate-pulse">
        Carregando detalhes do seu pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900">Pedido não encontrado</h2>
        <p className="text-xs text-neutral-500 mt-2">Verifique o número do pedido digitado.</p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg"
        >
          Ir para a Página Inicial
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELADO';
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  // Fake PIX payload for demo copy-paste
  const pixCopyPaste = `00020126580014br.gov.bcb.pix0136${order.id}5204000053039865405${order.total.toFixed(2)}5802BR5920CHOTE STORE OFICIAL6009SAO PAULO62070503***6304`;

  const copyPixToClipboard = () => {
    navigator.clipboard.writeText(pixCopyPaste);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8" id="printable-order">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Pedido Confirmado com Sucesso</span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Pedido {order.orderNumber}
        </h1>
        <p className="text-xs text-neutral-500 max-w-lg mx-auto">
          Obrigado pela sua compra, <span className="font-semibold text-neutral-800">{order.customerName}</span>! Enviamos a confirmação e os detalhes completos para <span className="font-semibold text-neutral-800">{order.customerEmail}</span>.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir Comprovante
          </button>
          <Link
            href="/produtos"
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>

      {/* PIX Payment Card if applicable */}
      {order.paymentMethod === 'PIX' && order.status !== 'CANCELADO' && (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <QrCode className="w-4 h-4 text-emerald-600" />
            Pagamento via PIX Instantâneo
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Simulated QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-emerald-100">
              <div className="w-36 h-36 bg-neutral-900 rounded-lg p-2 flex items-center justify-center">
                {/* SVG QR Code pattern */}
                <div className="w-full h-full bg-white p-2 rounded grid grid-cols-6 gap-1">
                  {[...Array(36)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        i % 2 === 0 || i % 5 === 0 || i < 7 || i > 28 ? 'bg-black' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 mt-2 font-mono">CHOTE-PIX-{order.orderNumber}</span>
            </div>

            <div className="md:col-span-2 space-y-3">
              <p className="text-xs text-neutral-700 leading-relaxed">
                Escaneie o QR Code com o aplicativo do seu banco ou copie a chave PIX abaixo para pagar no modo <span className="font-bold">PIX Copia e Cola</span>:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixCopyPaste}
                  className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono text-neutral-600 outline-none"
                />
                <button
                  onClick={copyPixToClipboard}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-emerald-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedPix ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <p className="text-[11px] text-emerald-800">
                O pagamento é processado e seu status atualizado em até 1 minuto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Acompanhamento do Pedido
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_MAP[order.status]?.bg} ${ORDER_STATUS_MAP[order.status]?.color}`}>
            {ORDER_STATUS_MAP[order.status]?.label || order.status}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>Este pedido foi cancelado e os produtos foram estornados ao estoque da loja.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? 'border-black bg-black text-white shadow-md'
                        : isDone
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                        : 'border-neutral-200 bg-white text-neutral-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] leading-tight font-medium ${
                      isCurrent ? 'font-bold text-neutral-900' : isDone ? 'text-neutral-700' : 'text-neutral-300'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tracking Code if Shipped */}
        {order.trackingCode && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-700" />
              <span>Código de Rastreamento Correios: <span className="font-mono font-bold text-neutral-900">{order.trackingCode}</span></span>
            </div>
            <a
              href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.trackingCode}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1"
            >
              Rastrear nos Correios <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Order Details & Items */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Mantos Comprados
        </h2>

        <div className="divide-y divide-neutral-100">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-4 flex items-center gap-4">
              <div className="relative w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                <Image
                  src={item.productImage || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800'}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                  {item.productName}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tamanho: <span className="font-semibold text-neutral-800">{item.size}</span> • Quantidade: <span className="font-semibold text-neutral-800">{item.quantity}</span>
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {formatCurrency(item.unitPrice)} unitário
                </p>
              </div>

              <span className="text-sm font-bold text-neutral-900">
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-neutral-900">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Desconto</span>
              <span>- {formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Frete</span>
            <span className="font-semibold text-neutral-900">
              {order.shippingCost === 0 ? <span className="text-emerald-700">GRÁTIS</span> : formatCurrency(order.shippingCost)}
            </span>
          </div>
          <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-neutral-900">Total Pago</span>
            <span className="text-2xl font-black text-neutral-900">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Shipping and Customer Info */}
        <div className="pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-600">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-neutral-900 mb-1">Endereço de Entrega</h4>
            <p className="leading-relaxed">{order.shippingAddress}</p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-neutral-900 mb-1">Forma de Pagamento</h4>
            <p className="leading-relaxed">{PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</p>
            <p className="text-neutral-400 mt-1">Data: {formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

