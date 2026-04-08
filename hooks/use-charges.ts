'use client';

import { useState, useEffect, useCallback } from 'react';
import { Charge } from '@/lib/types';
import * as actions from '@/app/actions';

export function useCharges() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await actions.getCharges();
      setCharges(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch charges');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  const refetch = useCallback(() => {
    fetchCharges();
  }, [fetchCharges]);

  return { charges, loading, error, refetch };
}
