'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Eye,
  Printer,
  XCircle,
  Truck,
  CheckCircle,
  Clock,
  PlusCircle,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatDate, ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/lib/formatters';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Order Modal for Details and Status Change
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (search) params.set('search', search);

    fetch(`/api/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingCodeInput(order.trackingCode || '');
    setStatusNotes('');
    setFeedback(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (newStatus === 'CANCELADO' && selectedOrder.status !== 'CANCELADO') {
      const confirmCancel = confirm(
        'ATENÇÃO: Ao cancelar o pedido, todas as unidades vendidas serão automaticamente devolvidas ao estoque da loja. Deseja prosseguir?'
      );
      if (!confirmCancel) return;
    }

    setUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingCode: trackingCodeInput || null,
          reason: statusNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar pedido');
      }

      setFeedback({ text: 'Status e dados do pedido atualizados com sucesso!', error: false });
      setSelectedOrder(data.order);
      fetchOrders();
    } catch (err: any) {
      setFeedback({ text: err.message || 'Erro ao atualizar pedido', error: true });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Vendas & Expedição</span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Gestão de Pedidos e Vendas</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Acompanhe o status de pagamentos, libere envios com código de rastreamento e faça cancelamentos com estorno de estoque.
          </p>
        </div>

        <Link
          href="/admin/pedidos/novo-manual"
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Registrar Venda Manual
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pgto' },
            { id: 'PAGAMENTO_APROVADO', label: 'Pagos' },
            { id: 'EM_PREPARACAO', label: 'Em Preparação' },
            { id: 'ENVIADO', label: 'Enviados' },
            { id: 'ENTREGUE', label: 'Entregues' },
            { id: 'CANCELADO', label: 'Cancelados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por #pedido, cliente, CPF..."
            className="w-full px-3 py-1.5 pl-8 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">Nenhum pedido encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Pedido / Data</th>
                  <th className="py-3.5 px-4">Cliente & Contato</th>
                  <th className="py-3.5 px-4">Origem</th>
                  <th className="py-3.5 px-4">Itens</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Pagamento</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => {
                  const statusInfo = ORDER_STATUS_MAP[ord.status] || {
                    label: ord.status,
                    bg: 'bg-neutral-100',
                    color: 'text-neutral-800',
                  };

                  const totalItemsCount = ord.items?.reduce((a: number, b: any) => a + b.quantity, 0) || 0;

                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-neutral-900 block">{ord.orderNumber}</span>
                        <span className="text-[11px] text-neutral-400">{formatDate(ord.createdAt)}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-neutral-900 block truncate max-w-[150px]">{ord.customerName}</span>
                        <span className="text-[11px] text-neutral-400 block">{ord.customerPhone}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                          {ord.origin === 'ONLINE' ? 'Loja Virtual' : ord.origin.replace('MANUAL_', '')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-800">{totalItemsCount} manto(s)</span>
                      </td>

                      <td className="py-3 px-4 font-black text-neutral-900">
                        {formatCurrency(ord.total)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-800 block text-[11px]">
                          {PAYMENT_METHOD_MAP[ord.paymentMethod] || ord.paymentMethod}
                        </span>
                        <span className={`text-[10px] font-bold ${ord.paymentStatus === 'APPROVED' ? 'text-emerald-700' : ord.paymentStatus === 'REFUNDED' ? 'text-rose-700' : 'text-amber-700'}`}>
                          {ord.paymentStatus === 'APPROVED' ? 'Aprovado' : ord.paymentStatus === 'REFUNDED' ? 'Estornado' : 'Pendente'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openOrderDetails(ord)}
                          className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Management & Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Detalhes da Venda</span>
                <h3 className="text-xl font-black text-neutral-900">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-neutral-500">Realizado em: {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1"
                  title="Imprimir pedido"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-black p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  feedback.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Alterar Status do Pedido
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Novo Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                  >
                    <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                    <option value="PAGAMENTO_APROVADO">Pagamento Aprovado</option>
                    <option value="EM_PREPARACAO">Em Preparação</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="SAIU_PARA_ENTREGA">Saiu para Entrega</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="CANCELADO">⚠️ Cancelado (Devolve ao Estoque)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Código de Rastreio</label>
                  <input
                    type="text"
                    value={trackingCodeInput}
                    onChange={(e) => setTrackingCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: BR123456789SP"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-neutral-300 rounded-lg outline-none focus:border-black uppercase bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Observações / Motivo</label>
                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Ex: Despachado via Sedex / Cancelado por solicitação do cliente..."
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50"
                >
                  {updating ? 'Salvando...' : 'Atualizar Pedido'}
                </button>
              </div>
            </form>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Itens Comprados
              </h4>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-neutral-900">{it.productName}</p>
                      <p className="text-[11px] text-neutral-500">
                        Tamanho: <span className="font-semibold text-neutral-800">{it.size}</span> • Qtd: <span className="font-semibold text-neutral-800">{it.quantity}</span> • Custo unitário: {formatCurrency(it.costPrice)}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-900">{formatCurrency(it.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div>
                <span className="font-bold uppercase tracking-wider text-neutral-900 block mb-1">Cliente</span>
                <p className="font-medium text-neutral-900">{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerEmail}</p>
                <p>{selectedOrder.customerPhone}</p>
                <p>CPF: {selectedOrder.customerCpf}</p>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-neutral-900 block mb-1">Entrega & Total</span>
                <p className="leading-relaxed">{selectedOrder.shippingAddress}</p>
                <div className="mt-2 pt-2 border-t border-neutral-200 font-bold text-neutral-900">
                  Total do Pedido: {formatCurrency(selectedOrder.total)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

