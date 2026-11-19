'use client';

import { useState, useEffect } from 'react';
import { CheckStatus, ClientCheck } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';

interface CheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  check?: ClientCheck | null;
}

function toDateInput(value?: string) {
  if (!value) return new Date().toISOString().split('T')[0];
  return value.slice(0, 10);
}

export default function CheckModal({ isOpen, onClose, onSuccess, check }: CheckModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isEditing = !!check;
  const [formData, setFormData] = useState({
    client_name: '',
    check_date: toDateInput(),
    amount: '',
    bank: '',
    check_number: '',
    notes: '',
    status: 'pending' as CheckStatus,
  });

  useEffect(() => {
    if (check) {
      setFormData({
        client_name: check.client_name,
        check_date: toDateInput(check.check_date),
        amount: String(check.amount ?? ''),
        bank: check.bank || '',
        check_number: check.check_number || '',
        notes: check.notes || '',
        status: check.status || 'pending',
      });
    } else {
      setFormData({
        client_name: '',
        check_date: toDateInput(),
        amount: '',
        bank: '',
        check_number: '',
        notes: '',
        status: 'pending',
      });
    }
  }, [check, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name.trim()) {
      alert(t('checkNameRequired'));
      return;
    }
    const amount = parseFloat(formData.amount);
    if (!formData.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      alert(t('checkAmountRequired'));
      return;
    }

    const payload = {
      client_name: formData.client_name.trim(),
      check_date: formData.check_date,
      amount,
      bank: formData.bank.trim() || null,
      check_number: formData.check_number.trim() || null,
      notes: formData.notes.trim() || null,
    };

    setLoading(true);
    try {
      if (isEditing && check) {
        await actions.updateClientCheck(check.id, { ...payload, status: formData.status });
      } else {
        await actions.addClientCheck(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(isEditing ? 'Error updating check:' : 'Error adding check:', error);
      alert(error instanceof Error ? error.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editCheck') : t('addCheck')}</DialogTitle>
          <DialogDescription>{t('checkFormDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_name">{t('checkName')}</Label>
            <Input
              id="client_name"
              name="client_name"
              type="text"
              value={formData.client_name}
              onChange={handleChange}
              placeholder={t('checkNamePlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="check_date">{t('checkDate')}</Label>
            <Input
              id="check_date"
              name="check_date"
              type="date"
              value={formData.check_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">{t('checkAmount')}</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bank">{t('checkBank')}</Label>
              <Input
                id="bank"
                name="bank"
                type="text"
                value={formData.bank}
                onChange={handleChange}
                placeholder={t('checkBankPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="check_number">{t('checkNumber')}</Label>
              <Input
                id="check_number"
                name="check_number"
                type="text"
                value={formData.check_number}
                onChange={handleChange}
                placeholder={t('checkNumberPlaceholder')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t('checkNotes')}</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full h-20 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {isEditing && (
            <div>
              <Label>{t('checkStatus')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CheckStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t('checkPending')}</SelectItem>
                  <SelectItem value="paid">{t('checkPaid')}</SelectItem>
                  <SelectItem value="unpaid">{t('checkUnpaid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : (isEditing ? t('editCheck') : t('addCheck'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
