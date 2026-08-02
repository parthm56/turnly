'use client';
import { useState, useEffect } from 'react';
import { subscribeToBusiness } from '@/lib/queueStore';

/** Real-time Firebase subscription for a single business */
export function useBusinessData(slug) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToBusiness(slug, (data) => {
      setBusiness(data);
      setLoading(false);
    });
    return unsub;
  }, [slug]);

  return { business, loading };
}

// Legacy compat (not used in new pages)
export function useHydratedQueueStore() {
  return { state: null, mounted: true };
}
