'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function AdminFinancialPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // day, week, month, year, all

  // Modal to add new transaction
  const [modalOpen, setModalOpen] = useState(false);
  const [transType, setTransType] = useState('DESPESA'); // DESPESA, RECEITA
  const [transCategory, setTransCategory] = useState('DESPESA_OPERACIONAL');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [supplier, setSupplier] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PAGO'); // PAGO, PENDENTE
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  const fetchFinancial = () => {
    setLoading(true);
    fetch(`/api/admin/financial?period=${period}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFinancial();
  }, [period]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transType,
          category: transCategory,
          description,
          amount: parseFloat(amount),
          paymentMethod,
          supplier: supplier || null,
          dueDate: dueDate || null,
          status,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Erro ao registrar movimentação');
      }

      setFeedback({ text: 'Movimentação registrada com sucesso!', error: false });
      setTimeout(() => {
        setModalOpen(false);
        setDescription('');
        setAmount('');
        setSupplier('');
        fetchFinancial();
      }, 1000);
    } catch (err: any) {
      setFeedback({ text: err.message || 'Erro ao registrar', error: true });
    } finally {
      setSaving(false);
    }
  };

  const ind = data?.indicators || {};
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-8">
      {/* Page Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Fluxo de Caixa & DRE</span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Controle Financeiro & Margens</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Diferenciação clara entre Faturamento Bruto, Custo das Mercadorias (CMV), Despesas e Lucro Líquido Real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-semibold bg-white border border-neutral-300 rounded-lg py-2 px-3 text-neutral-800 outline-none focus:border-black cursor-pointer shadow-sm"
          >
            <option value="day">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
            <option value="all">Todo o Período</option>
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Despesa / Receita
          </button>
        </div>
      </div>

      {/* FINANCIAL INDICATORS - DRE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Faturamento Bruto */}
        <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">1. Faturamento Bruto</span>
          <p className="text-2xl font-black text-neutral-900">{formatCurrency(ind.faturamentoBruto)}</p>
          <span className="text-[10px] text-neutral-400 block">Total de vendas brutas</span>
        </div>

        {/* CMV (Custo das Mercadorias Vendidas) */}
        <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">2. Custo Mercadoria (CMV)</span>
          <p className="text-2xl font-black text-rose-700">- {formatCurrency(ind.cmvTotal)}</p>
          <span className="text-[10px] text-neutral-400 block">Custo de aquisição dos itens</span>
        </div>

        {/* Lucro Bruto */}
        <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">3. Lucro Bruto</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {ind.margemBruta?.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-800">{formatCurrency(ind.lucroBruto)}</p>
          <span className="text-[10px] text-neutral-400 block">Faturamento menos CMV</span>
        </div>

        {/* Lucro Líquido Real */}
        <div className="p-5 bg-neutral-900 text-white rounded-2xl shadow-md space-y-1 border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">4. Lucro Líquido Real</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-neutral-800 px-1.5 py-0.5 rounded">
              {ind.margemLiquida?.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatCurrency(ind.lucroLiquido)}</p>
          <span className="text-[10px] text-neutral-400 block">Após todas as despesas operacionais</span>
        </div>

        {/* Despesas Operacionais */}
        <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Despesas Operacionais</span>
          <p className="text-xl font-black text-neutral-800">{formatCurrency(ind.despesasOperacionais)}</p>
          <span className="text-[10px] text-neutral-400 block">Fretes, embalagens, taxas, nuvem</span>
        </div>

        {/* Compras de Estoque */}
        <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Compras de Estoque</span>
          <p className="text-xl font-black text-neutral-800">{formatCurrency(ind.comprasEstoque)}</p>
          <span className="text-[10px] text-neutral-400 block">Lotes de mercadorias no período</span>
        </div>

        {/* Contas a Pagar */}
        <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Contas a Pagar</span>
          <p className="text-xl font-black text-amber-600">{formatCurrency(ind.contasAPagar)}</p>
          <span className="text-[10px] text-neutral-400 block">Compromissos pendentes</span>
        </div>

        {/* Contas a Receber */}
        <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Contas a Receber</span>
          <p className="text-xl font-black text-blue-600">{formatCurrency(ind.contasAReceber)}</p>
          <span className="text-[10px] text-neutral-400 block">Recebimentos agendados</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Lançamentos Financeiros ({transactions.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-500">Carregando movimentações...</div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">Nenhum lançamento no período selecionado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3">Descrição</th>
                  <th className="py-3 px-3">Fornecedor / Origem</th>
                  <th className="py-3 px-3">Forma Pagto</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transactions.map((t: any) => {
                  const isReceita = t.type === 'RECEITA';

                  return (
                    <tr key={t.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-3 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                          isReceita ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isReceita ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isReceita ? 'Receita' : 'Despesa'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-neutral-700">
                        {t.category.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-3 font-medium text-neutral-900 truncate max-w-xs">
                        {t.description}
                      </td>

                      <td className="py-3 px-3 text-neutral-500">{t.supplier || '-'}</td>

                      <td className="py-3 px-3 text-neutral-600">{t.paymentMethod || '-'}</td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'PAGO' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {t.status === 'PAGO' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>

                      <td className={`py-3 px-3 text-right font-black font-mono text-xs ${
                        isReceita ? 'text-emerald-700' : 'text-neutral-900'
                      }`}>
                        {isReceita ? '+' : '-'} {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-neutral-900">Novo Lançamento Financeiro</h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
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

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Tipo de Lançamento</label>
                  <select
                    value={transType}
                    onChange={(e) => {
                      setTransType(e.target.value);
                      if (e.target.value === 'RECEITA') setTransCategory('OUTRA_RECEITA');
                      else setTransCategory('DESPESA_OPERACIONAL');
                    }}
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                  >
                    <option value="DESPESA">🔴 Saída / Despesa</option>
                    <option value="RECEITA">🟢 Entrada / Receita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Categoria</label>
                  <select
                    value={transCategory}
                    onChange={(e) => setTransCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
                  >
                    {transType === 'DESPESA' ? (
                      <>
                        <option value="COMPRA_MERCADORIA">Compra de Mercadoria / Lotes</option>
                        <option value="FRETE">Fretes e Logística</option>
                        <option value="EMBALAGEM">Embalagens Personalizadas</option>
                        <option value="TAXA_GATEWAY">Taxas de Cartão / Gateway</option>
                        <option value="DESPESA_OPERACIONAL">Despesa Operacional / Hospedagem</option>
                        <option value="OUTRA_DESPESA">Outras Despesas</option>
                      </>
                    ) : (
                      <>
                        <option value="RECEBIMENTO">Recebimento de Venda</option>
                        <option value="OUTRA_RECEITA">Outra Receita Extraordinária</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Fatura correios semanal, Lote camisas..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="350.00"
                    className="w-full px-3 py-2 text-xs font-bold border border-neutral-300 rounded-lg outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black bg-white font-semibold"
                  >
                    <option value="PAGO">Pago / Liquidado</option>
                    <option value="PENDENTE">Pendente (A Pagar/Receber)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Fornecedor / Beneficiário</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ex: Gráfica, Fornecedor..."
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Forma de Pagamento</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="PIX, Boleto, Cartão..."
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

