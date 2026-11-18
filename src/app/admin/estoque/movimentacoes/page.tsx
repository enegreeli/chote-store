'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, ArrowLeft, Filter, Download } from 'lucide-react';
import { formatDate, MOVEMENT_TYPE_MAP } from '@/lib/formatters';

export default function StockMovementsHistoryPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchMovements = () => {
    setLoading(true);
    const url = `/api/admin/inventory/movements?type=${typeFilter}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.movements) setMovements(data.movements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovements();
  }, [typeFilter]);

  const exportCSV = () => {
    const headers = ['Data', 'Produto', 'SKU', 'Tamanho', 'Tipo', 'Qtd', 'Estoque Anterior', 'Novo Estoque', 'Motivo', 'Responsável'];
    const rows = movements.map((m) => [
      formatDate(m.createdAt),
      `"${m.product.name}"`,
      m.product.sku,
      m.size,
      m.type,
      m.quantity,
      m.previousStock,
      m.newStock,
      `"${m.reason || '-'}"`,
      m.createdBy?.name || 'Sistema',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movimentacoes-estoque-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <Link
            href="/admin/estoque"
            className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Estoque
          </Link>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Histórico de Movimentações</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registro de auditoria completo com entradas, baixas por venda, perdas, avarias e ajustes manuais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-neutral-300 rounded-lg py-2 px-3 text-neutral-800 outline-none focus:border-black cursor-pointer shadow-sm"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="ENTRADA">Entrada de Mercadoria</option>
            <option value="SAIDA_VENDA">Saída por Venda</option>
            <option value="SAIDA_AVARIA">Avaria / Defeito</option>
            <option value="SAIDA_PERDA">Perda / Extravio</option>
            <option value="DEVOLUCAO">Devolução</option>
            <option value="AJUSTE">Ajuste de Inventário</option>
          </select>

          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-800 hover:bg-neutral-100 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Carregando histórico...</div>
        ) : movements.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">Nenhuma movimentação registrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Produto & SKU</th>
                  <th className="py-3 px-4">Tamanho</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-center">Quantidade</th>
                  <th className="py-3 px-4 text-center">Anterior → Novo</th>
                  <th className="py-3 px-4">Motivo / Detalhes</th>
                  <th className="py-3 px-4">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {movements.map((m) => {
                  const typeInfo = MOVEMENT_TYPE_MAP[m.type] || {
                    label: m.type,
                    sign: '',
                    color: 'text-neutral-700',
                  };

                  return (
                    <tr key={m.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-neutral-900 block truncate max-w-xs">{m.product.name}</span>
                        <span className="text-[10px] text-neutral-400">SKU: {m.product.sku}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900">{m.size}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                      </td>
                      <td className={`py-3 px-4 text-center font-bold font-mono text-sm ${typeInfo.color}`}>
                        {typeInfo.sign}{m.quantity}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-neutral-600">
                        {m.previousStock} un. → <span className="font-bold text-neutral-900">{m.newStock} un.</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 truncate max-w-xs">{m.reason || '-'}</td>
                      <td className="py-3 px-4 font-medium text-neutral-800">{m.createdBy?.name || 'Sistema'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

