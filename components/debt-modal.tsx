'use client';

import { useState } from 'react';
import { CustomerDebt, SupplierDebt } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';

type Debt = CustomerDebt | SupplierDebt;

interface DebtModalProps {
  isOpen: boolean;
  debt: Debt | null;
  type: 'customer' | 'supplier';
  onClose: () => void;
  onSuccess: () => void;
}

export default function DebtModal({ isOpen, debt, type, onClose, onSuccess }: DebtModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    type === 'customer'
      ? {
          customer_name: (debt as CustomerDebt)?.customer_name || '',
          phone: (debt as CustomerDebt)?.phone || '',
          email: (debt as CustomerDebt)?.email || '',
          total_debt: (debt as CustomerDebt)?.total_debt || 0,
          notes: (debt as CustomerDebt)?.notes || '',
        }
      : {
          supplier_name: (debt as SupplierDebt)?.supplier_name || '',
          contact_person: (debt as SupplierDebt)?.contact_person || '',
          phone: (debt as SupplierDebt)?.phone || '',
          total_debt: (debt as SupplierDebt)?.total_debt || 0,
          notes: (debt as SupplierDebt)?.notes || '',
        }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_debt' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      notes: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'customer') {
        if (debt) {
          await actions.updateCustomerDebt(debt.id, formData);
        } else {
          await actions.addCustomerDebt(formData as Omit<CustomerDebt, 'id' | 'created_at' | 'updated_at'>);
        }
      } else {
        if (debt) {
          await actions.updateSupplierDebt(debt.id, formData);
        } else {
          await actions.addSupplierDebt(formData as Omit<SupplierDebt, 'id' | 'created_at' | 'updated_at'>);
        }
      }
      onSuccess();
    } catch (error) {
      console.error(`Error saving ${type} debt:`, error);
      alert(t('saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {debt
              ? type === 'customer'
                ? t('editCustomerDebt')
                : t('editSupplierDebt')
              : type === 'customer'
                ? t('newCustomerDebt')
                : t('newSupplierDebt')
            }
          </DialogTitle>
          <DialogDescription>
            {debt
              ? t('updateDebtDetails')
              : t('createDebtAccount')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'customer' ? (
            <>
              <div>
                <Label htmlFor="customer_name">{t('customerName')}</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={(formData as any).customer_name}
                  onChange={handleChange}
                  placeholder={t('customerNamePlaceholder')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={(formData as any).email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="supplier_name">{t('supplierName')}</Label>
                <Input
                  id="supplier_name"
                  name="supplier_name"
                  value={(formData as any).supplier_name}
                  onChange={handleChange}
                  placeholder={t('supplierNamePlaceholder')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_person">{t('contactPerson')}</Label>
                <Input
                  id="contact_person"
                  name="contact_person"
                  value={(formData as any).contact_person}
                  onChange={handleChange}
                  placeholder={t('contactPersonPlaceholder')}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              name="phone"
              value={(formData as any).phone}
              onChange={handleChange}
              placeholder={t('phonePlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="total_debt">{t('totalDebt')}</Label>
            <Input
              id="total_debt"
              name="total_debt"
              type="number"
              step="0.01"
              value={(formData as any).total_debt}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">{t('notes')}</Label>
            <textarea
              id="notes"
              value={(formData as any).notes}
              onChange={handleNotesChange}
              placeholder={t('debtNotesPlaceholder')}
              className="w-full h-16 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('saving') : t('saveDebt')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
