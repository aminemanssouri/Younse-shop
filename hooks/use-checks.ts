'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientCheck } from '@/lib/types';
import * as actions from '@/app/actions';

export function useChecks() {
  const [checks, setChecks] = useState<ClientCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await actions.getClientChecks();
      setChecks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  const refetch = useCallback(() => {
    fetchChecks();
  }, [fetchChecks]);

  return { checks, loading, error, refetch };
}
