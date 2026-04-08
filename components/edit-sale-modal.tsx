'use client';

import { useState, useEffect } from 'react';
import { Sale } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';

interface EditSaleModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSaleModal({ sale, isOpen, onClose, onSuccess }: EditSaleModalProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'completed' | 'pending'>('pending');
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (sale) {
      setStatus(sale.status || 'completed');
      setAmountPaid(sale.amount_paid ?? sale.total_amount);
      setNotes(sale.notes || '');
    }
  }, [sale, isOpen]);

  if (!sale) return null;

  const remainingDebt = Math.max(0, sale.total_amount - amountPaid);

  const handleStatusChange = (value: string) => {
    const newStatus = value as 'completed' | 'pending';
    setStatus(newStatus);
    if (newStatus === 'completed') {
      setAmountPaid(sale.total_amount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    setLoading(true);
    try {
      await actions.updateSale(sale.id, {
        status,
        amount_paid: amountPaid,
        notes,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating sale:', error);
      alert(error instanceof Error ? error.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editSale')}</DialogTitle>
          <DialogDescription>{t('editSaleDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sale Summary */}
          <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('product')}:</span>
              <span className="font-medium">{(sale as any).product_name || sale.product_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('totalAmount')}:</span>
              <span className="font-semibold">{displayPrice(sale.total_amount, language)}</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>{t('saleStatus')}</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">{t('saleCompleted')}</SelectItem>
                <SelectItem value="pending">{t('salePending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Paid */}
          <div>
            <Label htmlFor="amount_paid">{t('amountPaid')}</Label>
            <Input
              id="amount_paid"
              type="number"
              step="0.01"
              min="0"
              max={sale.total_amount}
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Remaining Debt */}
          {remainingDebt > 0 && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-red-700 dark:text-red-400 font-medium">{t('remainingDebt')}:</span>
                <span className="font-bold text-lg text-red-600 dark:text-red-400">
                  {displayPrice(remainingDebt, language)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">{t('notes')}</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('saleNotesPlaceholder')}
              className="w-full h-20 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('updating') : t('updateSale')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
