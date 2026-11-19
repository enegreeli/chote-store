'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'chote_master_db_snapshot_v1';
const WIPED_FLAG = 'chote_master_db_explicitly_wiped';

/**
 * Global background auto-sync & heal engine.
 * Ensures the store never shows an empty catalog if a serverless container restarts.
 */
export default function GlobalStoreSync() {
  useEffect(() => {
    const checkAndHeal = async () => {
      try {
        const localSnapshot = localStorage.getItem(STORAGE_KEY);
        const isExplicitlyWiped = localStorage.getItem(WIPED_FLAG) === 'true';

        if (!localSnapshot || isExplicitlyWiped) return;

        const res = await fetch('/api/products?take=1', { cache: 'no-store' });
        if (!res.ok) return;

        const data = await res.json();
        if (data.products && data.products.length === 0) {
          const parsed = JSON.parse(localSnapshot);
          if (parsed && parsed.products && parsed.products.length > 0) {
            await fetch('/api/admin/system/reset', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'import_json',
                data: parsed,
              }),
            });
          }
        }
      } catch {}
    };

    checkAndHeal();
  }, []);

  return null;
}
