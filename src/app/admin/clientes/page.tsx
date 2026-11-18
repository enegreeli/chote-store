'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, MapPin, ShoppingBag, Eye, X } from 'lucide-react';
import { formatCurrency, formatDate, formatCPF, formatPhone } from '@/lib/formatters';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    fetch(`/api/admin/customers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Base de Usuários</span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Cadastro de Clientes</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Consulte histórico de compras, ticket total acumulado, endereços e informações de contato.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, e-mail, CPF, telefone..."
            className="w-full px-3 py-1.5 pl-8 text-xs border border-neutral-300 rounded-lg outline-none focus:border-black"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">Carregando clientes...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">Nenhum cliente cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Contato</th>
                  <th className="py-3.5 px-4">CPF</th>
                  <th className="py-3.5 px-4 text-center">Pedidos</th>
                  <th className="py-3.5 px-4">Total Gasto</th>
                  <th className="py-3.5 px-4">Última Compra</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 block">{c.name}</span>
                          <span className="text-[10px] text-neutral-400">Cliente desde {formatDate(c.createdAt)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-neutral-800 block">{c.email}</span>
                      <span className="text-[11px] text-neutral-500">{formatPhone(c.phone)}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-700">{formatCPF(c.cpf)}</td>

                    <td className="py-3 px-4 text-center font-bold text-neutral-900">
                      {c.totalOrders} pedido(s)
                    </td>

                    <td className="py-3 px-4 font-black text-neutral-900">
                      {formatCurrency(c.totalSpent)}
                    </td>

                    <td className="py-3 px-4 text-neutral-600 text-[11px]">
                      {c.lastPurchaseAt ? formatDate(c.lastPurchaseAt) : 'Sem compras'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-black flex items-center justify-center">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-neutral-500">{selectedCustomer.email} • {formatPhone(selectedCustomer.phone)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <div>
                <span className="text-neutral-400 block">Total Gasto</span>
                <span className="text-base font-black text-neutral-900">{formatCurrency(selectedCustomer.totalSpent)}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Total de Pedidos</span>
                <span className="text-base font-black text-neutral-900">{selectedCustomer.totalOrders}</span>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Endereços Cadastrados ({selectedCustomer.addresses?.length || 0})
              </h4>
              {selectedCustomer.addresses?.length === 0 ? (
                <p className="text-xs text-neutral-400">Nenhum endereço salvo.</p>
              ) : (
                selectedCustomer.addresses?.map((addr: any) => (
                  <div key={addr.id} className="p-3 bg-white border border-neutral-200 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-neutral-900">{addr.recipientName}</p>
                    <p className="text-neutral-600">{addr.street}, {addr.number} {addr.complement && `(${addr.complement})`}</p>
                    <p className="text-neutral-500">{addr.neighborhood} - {addr.city} / {addr.state} - CEP: {addr.zipCode}</p>
                  </div>
                ))
              )}
            </div>

            {/* Orders list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Histórico de Pedidos
              </h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-neutral-100 border border-neutral-200 rounded-xl">
                {selectedCustomer.orders?.length === 0 ? (
                  <p className="p-4 text-xs text-neutral-400 text-center">Nenhum pedido realizado.</p>
                ) : (
                  selectedCustomer.orders?.map((ord: any) => (
                    <div key={ord.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-neutral-50">
                      <div>
                        <span className="font-bold text-neutral-900">{ord.orderNumber}</span>
                        <span className="text-neutral-400 ml-2">{formatDate(ord.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{formatCurrency(ord.total)}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

