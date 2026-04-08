'use client';

import { useState, useEffect } from 'react';
import { Charge } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  charge?: Charge | null;
}

export default function ChargeModal({ isOpen, onClose, onSuccess, initialDate, charge }: ChargeModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isEditing = !!charge;
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    charge_date: initialDate || new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (charge) {
      setFormData({
        name: charge.name,
        amount: charge.amount,
        charge_date: new Date(charge.charge_date).toISOString().split('T')[0],
        notes: charge.notes || '',
      });
    } else {
      setFormData({
        name: '',
        amount: 0,
        charge_date: initialDate || new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [charge, initialDate, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(t('requiredField'));
      return;
    }

    setLoading(true);
    try {
      if (isEditing && charge) {
        await actions.updateCharge(charge.id, {
          name: formData.name.trim(),
          amount: formData.amount,
          charge_date: new Date(formData.charge_date).toISOString(),
          notes: formData.notes.trim() || undefined,
        });
      } else {
        await actions.addCharge({
          name: formData.name.trim(),
          amount: formData.amount,
          charge_date: new Date(formData.charge_date).toISOString(),
          notes: formData.notes.trim() || undefined,
        });
      }
      onSuccess();
      onClose();
      if (!isEditing) {
        setFormData({
          name: '',
          amount: 0,
          charge_date: initialDate || new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    } catch (error) {
      console.error(isEditing ? 'Error updating charge:' : 'Error adding charge:', error);
      alert(error instanceof Error ? error.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editCharge') || 'Edit Charge' : t('addCharge')}</DialogTitle>
          <DialogDescription>
            {t('chargeNamePlaceholder')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="charge_date">{t('chargeDate')}</Label>
            <Input
              id="charge_date"
              name="charge_date"
              type="date"
              value={formData.charge_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="name">{t('chargeName')}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('chargeNamePlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">{t('chargeAmount')}</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">{t('chargeNotes')}</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('saleNotesPlaceholder')}
              className="w-full h-20 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : (isEditing ? t('updateCharge') || 'Update' : t('addCharge'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
