'use client';

import React, { useEffect, useState } from 'react';
import { Database, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'chote_master_db_snapshot_v1';
const COUNT_KEY = 'chote_master_db_count_v1';
const WIPED_FLAG = 'chote_master_db_explicitly_wiped';

export default function AdminAutoSync() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'restored' | 'saved'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const syncCheck = async () => {
    try {
      const res = await fetch('/api/admin/system/reset', { cache: 'no-store' });
      if (!res.ok) return;

      const result = await res.json();
      if (!result.success || !result.data) return;

      const serverData = result.data;
      const serverProducts = serverData.products || [];
      const serverCount = serverProducts.length;

      setProductCount(serverCount);

      const localSnapshot = localStorage.getItem(STORAGE_KEY);
      const isExplicitlyWiped = localStorage.getItem(WIPED_FLAG) === 'true';

      // Case A: Server has products, save to client master storage
      if (serverCount > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
        localStorage.setItem(COUNT_KEY, serverCount.toString());
        localStorage.removeItem(WIPED_FLAG);
        setSyncStatus('saved');
        return;
      }

      // Case B: Server has 0 products, but local snapshot has products and user didn't wipe
      if (serverCount === 0 && localSnapshot && !isExplicitlyWiped) {
        try {
          const parsed = JSON.parse(localSnapshot);
          if (parsed.products && parsed.products.length > 0) {
            setSyncStatus('syncing');
            setMessage('Restaurando produtos do catálogo...');

            const restoreRes = await fetch('/api/admin/system/reset', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'import_json',
                data: parsed,
              }),
            });

            if (restoreRes.ok) {
              setProductCount(parsed.products.length);
              setSyncStatus('restored');
              setMessage(`${parsed.products.length} produto(s) preservados e restaurados com sucesso!`);
              setTimeout(() => {
                setSyncStatus('idle');
                setMessage(null);
                // Trigger page refresh if on products page so user sees them immediately
                if (window.location.pathname.includes('/admin/produtos') || window.location.pathname.includes('/admin/estoque')) {
                  window.location.reload();
                }
              }, 2500);
            }
          }
        } catch (e) {
          console.warn('Auto-heal restore error:', e);
        }
      }
    } catch (e) {
      console.warn('Sync check error:', e);
    }
  };

  useEffect(() => {
    syncCheck();

    // Re-check periodically every 15 seconds
    const interval = setInterval(syncCheck, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/system/reset');
      const data = await res.json();
      if (res.ok && data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `store_db_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      alert('Erro ao baixar backup.');
    }
  };

  return (
    <>
      {message && (
        <div className="fixed bottom-4 right-4 z-50 p-3 bg-neutral-900 text-white rounded-xl shadow-2xl border border-neutral-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="hidden md:flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-neutral-800">
          Banco Local Ativo {productCount !== null ? `(${productCount} produtos)` : ''}
        </span>
        <button
          onClick={handleDownloadBackup}
          className="ml-2 text-[10px] font-bold text-neutral-500 hover:text-black underline flex items-center gap-1"
          title="Baixar cópia de segurança do arquivo store_db.json"
        >
          <Download className="w-3 h-3" /> Backup JSON
        </button>
      </div>
    </>
  );
}
