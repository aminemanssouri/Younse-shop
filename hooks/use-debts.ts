'use client';

import { useState, useEffect } from 'react';
import { CustomerDebt, SupplierDebt } from '@/lib/types';
import * as actions from '@/app/actions';

export function useCustomerDebts() {
  const [debts, setDebts] = useState<CustomerDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const data = await actions.getCustomerDebts();
      setDebts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer debts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  return { debts, loading, error, refetch: fetchDebts };
}

export function useSupplierDebts() {
  const [debts, setDebts] = useState<SupplierDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const data = await actions.getSupplierDebts();
      setDebts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier debts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  return { debts, loading, error, refetch: fetchDebts };
}
