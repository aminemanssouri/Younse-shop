'use client';

import { CustomerDebt, SupplierDebt } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Eye } from 'lucide-react';
import * as actions from '@/app/actions';
import { DetailsDialog } from '@/components/details-dialog';
import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';

type Debt = CustomerDebt | SupplierDebt;

interface DebtTableProps {
  debts: Debt[];
  type: 'customer' | 'supplier';
  onEdit: (debt: Debt) => void;
  onRefresh: () => void;
}

export default function DebtTable({ debts, type, onEdit, onRefresh }: DebtTableProps) {
  const { t, language } = useLanguage();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm(t(type === 'customer' ? 'confirmDeleteCustomerDebt' : 'confirmDeleteSupplierDebt'))) return;
    
    try {
      if (type === 'customer') {
        await actions.deleteCustomerDebt(id);
      } else {
        await actions.deleteSupplierDebt(id);
      }
      onRefresh();
    } catch (error) {
      console.error(`Error deleting ${type} debt:`, error);
      alert(t('deleteFailed'));
    }
  };

  const getNameField = (debt: Debt) => {
    if (type === 'customer') {
      return (debt as CustomerDebt).customer_name;
    } else {
      return (debt as SupplierDebt).supplier_name;
    }
  };

  const getContactField = (debt: Debt) => {
    if (type === 'customer') {
      return (debt as CustomerDebt).email || t('notAvailable');
    } else {
      return (debt as SupplierDebt).contact_person || t('notAvailable');
    }
  };

  const handleView = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsViewOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {type === 'customer' ? t('customerName') : t('supplierName')}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {type === 'customer' ? t('email') : t('contactPerson')}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">{t('phone')}</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">{t('totalDebt')}</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {debts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                {t(type === 'customer' ? 'noCustomerDebts' : 'noSupplierDebts')}
              </td>
            </tr>
          ) : (
            debts.map((debt) => (
              <tr key={debt.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3 font-medium text-foreground">{getNameField(debt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{getContactField(debt)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {debt.phone || t('notAvailable')}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    debt.total_debt > 0 
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {displayPrice(debt.total_debt, language)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(debt)}
                      title={t('view')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(debt)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(debt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <DetailsDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={t('details')}
      >
        {selectedDebt && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('name')}</p>
              <p className="font-medium">{getNameField(selectedDebt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{type === 'customer' ? t('email') : t('contactPerson')}</p>
              <p className="font-medium">{getContactField(selectedDebt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('phone')}</p>
              <p className="font-medium">{selectedDebt.phone || t('notAvailable')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('totalDebt')}</p>
              <p className="font-medium">{displayPrice(selectedDebt.total_debt, language)}</p>
            </div>
            {(selectedDebt as any).notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground">{t('notes')}</p>
                <p className="whitespace-pre-wrap">{(selectedDebt as any).notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailsDialog>
    </div>
  );
}
