'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Boxes,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ChevronRight,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { formatCurrency, formatDate, ORDER_STATUS_MAP } from '@/lib/formatters';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const fetchDashboard = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    fetch(`/api/admin/dashboard?period=${period}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setData(d);
          setLastSync(new Date());
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!isSilent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();

    // Auto refresh dashboard metrics every 5 seconds
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 5000);

    const handleFocus = () => fetchDashboard(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [period]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockList = data?.lowStockList || [];

  return (
    <div className="space-y-8">
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Dashboard Geral</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Visão consolidada da operação, estoque, vendas e faturamento da Chote Store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/pedidos/novo-manual"
            className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Nova Venda Manual
          </Link>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-semibold bg-white border border-neutral-300 rounded-lg py-2 px-3 text-neutral-800 outline-none focus:border-black cursor-pointer shadow-sm"
          >
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
        </div>
      </div>

      {/* 10 CORE KPI INDICATORS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Faturamento do Dia */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faturamento Hoje</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-neutral-900">{formatCurrency(kpis.revenueToday)}</p>
          <span className="text-[10px] text-neutral-400">Vendas confirmadas hoje</span>
        </div>

        {/* Faturamento do Mês */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faturamento Mês</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-neutral-900">{formatCurrency(kpis.revenueMonth)}</p>
          <span className="text-[10px] text-neutral-400">Mês corrente</span>
        </div>

        {/* Total de Vendas */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Vendas</span>
            <ShoppingBag className="w-4 h-4 text-neutral-700" />
          </div>
          <p className="text-xl font-black text-neutral-900">{kpis.totalSalesCount || 0}</p>
          <span className="text-[10px] text-neutral-400">Pedidos aprovados/ativos</span>
        </div>

        {/* Lucro Estimado */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lucro Bruto Real</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-950">{formatCurrency(kpis.totalEstimatedProfit)}</p>
          <span className="text-[10px] text-neutral-400">Faturamento menos custo</span>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ticket Médio</span>
            <DollarSign className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="text-xl font-black text-neutral-900">{formatCurrency(kpis.ticketMedio)}</p>
          <span className="text-[10px] text-neutral-400">Média por pedido</span>
        </div>

        {/* Pedidos Pendentes */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pendentes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600">{kpis.pendingOrdersCount || 0}</p>
          <span className="text-[10px] text-neutral-400">Aguardando ou preparando</span>
        </div>

        {/* Pedidos Concluídos */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Concluídos</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700">{kpis.completedOrdersCount || 0}</p>
          <span className="text-[10px] text-neutral-400">Entregues com sucesso</span>
        </div>

        {/* Total Produtos Cadastrados */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Produtos Ativos</span>
            <Package className="w-4 h-4 text-neutral-600" />
          </div>
          <p className="text-xl font-black text-neutral-900">{kpis.totalProducts || 0}</p>
          <span className="text-[10px] text-neutral-400">Modelos no catálogo</span>
        </div>

        {/* Produtos com Estoque Baixo */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Estoque Baixo</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600">{kpis.lowStockCount || 0}</p>
          <span className="text-[10px] text-neutral-400">Tamanhos em alerta</span>
        </div>

        {/* Produtos Sem Estoque */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sem Estoque</span>
            <Boxes className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600">{kpis.outOfStockCount || 0}</p>
          <span className="text-[10px] text-neutral-400">Tamanhos zerados</span>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Evolution Over Days */}
        <div className="lg:col-span-2 p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Evolução Diária de Vendas & Faturamento
              </h3>
              <p className="text-xs text-neutral-400">Valores em R$ gerados nos últimos 14 dias</p>
            </div>
            <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded">
              Últimos 14 Dias
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.salesByDayChart || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Faturamento']}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{ backgroundColor: '#111', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Selling Products */}
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Produtos Mais Vendidos
            </h3>
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Por Unidades</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts.topProductsChart || []}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#555' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} unidades vendidas`, 'Qtd']}
                  contentStyle={{ backgroundColor: '#111', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="quantity" fill="#111111" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LOWER ROW: RECENT ORDERS & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Últimos Pedidos Registrados
            </h3>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1"
            >
              Ver Todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-3">Pedido</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Origem</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((ord: any) => {
                  const statusInfo = ORDER_STATUS_MAP[ord.status] || {
                    label: ord.status,
                    bg: 'bg-neutral-100',
                    color: 'text-neutral-800',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-neutral-900">{ord.orderNumber}</td>
                      <td className="py-3 px-3 font-medium text-neutral-800 truncate max-w-[120px]">
                        {ord.customerName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                          {ord.origin === 'ONLINE' ? 'Loja Online' : 'WhatsApp/Balcão'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-neutral-900">{formatCurrency(ord.total)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/admin/pedidos"
                          className="text-neutral-600 hover:text-black font-semibold text-[11px]"
                        >
                          Gerenciar →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Alertas de Reposição
              </h3>
            </div>
            <Link
              href="/admin/estoque?filter=low"
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              Estoque Completo
            </Link>
          </div>

          <p className="text-xs text-neutral-500">
            Itens que atingiram ou estão abaixo do estoque mínimo configurado:
          </p>

          <div className="space-y-2.5">
            {lowStockList.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">Nenhum produto em nível crítico de estoque.</p>
            ) : (
              lowStockList.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-neutral-900 truncate max-w-[150px]">{item.productName}</h4>
                    <p className="text-[11px] text-neutral-500">Tamanho {item.size} • SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600">{item.stock} un.</span>
                    <p className="text-[10px] text-neutral-400">Mínimo: {item.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

