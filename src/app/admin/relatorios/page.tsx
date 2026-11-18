'use client';

import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Boxes,
  Flame,
  Clock,
  TrendingUp,
  DollarSign,
  History,
  Users,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

const REPORT_TYPES = [
  { id: 'stock', title: 'Estoque Atual por Tamanho', icon: Boxes, desc: 'Quantidade de cada camisa em cada tamanho (P, M, G, GG) e capital imobilizado.' },
  { id: 'best-sellers', title: 'Produtos Mais Vendidos', icon: Flame, desc: 'Classificação por volume de saída, faturamento bruto e lucro gerado.' },
  { id: 'idle-products', title: 'Produtos Parados / Sem Giro', icon: Clock, desc: 'Itens com estoque que não tiveram vendas nos últimos 30 dias.' },
  { id: 'profit-by-product', title: 'Lucro Real por Manto', icon: TrendingUp, desc: 'Comparativo de margem percentual e lucro líquido gerado por cada modelo.' },
  { id: 'expenses', title: 'Despesas e Compras de Lotes', icon: DollarSign, desc: 'Detalhamento de saídas operacionais, fornecedores e embalagens.' },
  { id: 'movements', title: 'Auditoria de Movimentações', icon: History, desc: 'Histórico de todas as entradas, perdas, devoluções e baixas.' },
];

export default function AdminReportsPage() {
  const [selectedType, setSelectedType] = useState('stock');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reports?type=${selectedType}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReportData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedType]);

  const handleExportCSV = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) return;

    const dataArr = reportData.data;
    const headers = Object.keys(dataArr[0]);

    const csvRows = [
      headers.join(';'),
      ...dataArr.map((row: any) =>
        headers.map((h) => `"${String(row[h] !== null && row[h] !== undefined ? row[h] : '').replace(/"/g, '""')}"`).join(';')
      ),
    ];

    const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${selectedType}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rows = reportData?.data || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Inteligência de Negócio</span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Relatórios & Exportação de Dados</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Analise dados gerenciais em tempo real e exporte relatórios em formato CSV / Excel com um clique.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={rows.length === 0}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Baixar Planilha CSV / Excel
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {REPORT_TYPES.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedType === rep.id;

          return (
            <button
              key={rep.id}
              onClick={() => setSelectedType(rep.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-2" />
              <span className="text-xs font-bold leading-tight line-clamp-2">{rep.title}</span>
            </button>
          );
        })}
      </div>

      {/* Report Preview */}
      <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              {reportData?.title || 'Relatório Gerencial'}
            </h3>
            <p className="text-xs text-neutral-500">
              {REPORT_TYPES.find((r) => r.id === selectedType)?.desc}
            </p>
          </div>
          <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full">
            {rows.length} registro(s)
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-500">Processando dados do relatório...</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">Nenhum dado encontrado para este relatório.</div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase tracking-wider font-bold text-[10px] sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="py-3 px-3">
                      {col.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {rows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                    {columns.map((col) => {
                      const val = row[col];
                      const isMoney = col.toLowerCase().includes('preco') || col.toLowerCase().includes('custo') || col.toLowerCase().includes('valor') || col.toLowerCase().includes('faturamento') || col.toLowerCase().includes('lucro') || col.toLowerCase().includes('gasto') || col.toLowerCase().includes('capital');

                      return (
                        <td key={col} className="py-2.5 px-3 text-neutral-800">
                          {isMoney && typeof val === 'number' ? (
                            <span className="font-mono font-bold">{formatCurrency(val)}</span>
                          ) : col === 'data' ? (
                            formatDate(val)
                          ) : (
                            String(val !== null && val !== undefined ? val : '-')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

