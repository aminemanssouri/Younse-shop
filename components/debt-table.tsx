'use client';

import { CustomerDebt, SupplierDebt } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import * as actions from '@/app/actions';

type Debt = CustomerDebt | SupplierDebt;

interface DebtTableProps {
  debts: Debt[];
  type: 'customer' | 'supplier';
  onEdit: (debt: Debt) => void;
  onRefresh: () => void;
}

export default function DebtTable({ debts, type, onEdit, onRefresh }: DebtTableProps) {
  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type} debt?`)) return;
    
    try {
      if (type === 'customer') {
        await actions.deleteCustomerDebt(id);
      } else {
        await actions.deleteSupplierDebt(id);
      }
      onRefresh();
    } catch (error) {
      console.error(`Error deleting ${type} debt:`, error);
      alert(`Failed to delete ${type} debt`);
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
      return (debt as CustomerDebt).email || 'N/A';
    } else {
      return (debt as SupplierDebt).contact_person || 'N/A';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {type === 'customer' ? 'Customer' : 'Supplier'} Name
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {type === 'customer' ? 'Email' : 'Contact Person'}
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">Phone</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">Total Debt</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {debts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No {type} debts found. Create one to get started.
              </td>
            </tr>
          ) : (
            debts.map((debt) => (
              <tr key={debt.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3 font-medium text-foreground">{getNameField(debt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{getContactField(debt)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {debt.phone || 'N/A'}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    debt.total_debt > 0 
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    ${debt.total_debt.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
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
    </div>
  );
}
