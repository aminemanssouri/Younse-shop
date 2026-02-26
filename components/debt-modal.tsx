'use client';

import { useState } from 'react';
import { CustomerDebt, SupplierDebt } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Debt = CustomerDebt | SupplierDebt;

interface DebtModalProps {
  isOpen: boolean;
  debt: Debt | null;
  type: 'customer' | 'supplier';
  onClose: () => void;
  onSuccess: () => void;
}

export default function DebtModal({ isOpen, debt, type, onClose, onSuccess }: DebtModalProps) {
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
      alert(`Failed to save ${type} debt`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {debt ? `Edit ${type === 'customer' ? 'Customer' : 'Supplier'} Debt` : `New ${type === 'customer' ? 'Customer' : 'Supplier'} Debt`}
          </DialogTitle>
          <DialogDescription>
            {debt 
              ? `Update ${type} debt details` 
              : `Create a new ${type} debt account`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'customer' ? (
            <>
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={(formData as any).customer_name}
                  onChange={handleChange}
                  placeholder="e.g., Ali's Furniture Store"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={(formData as any).email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="supplier_name">Supplier Name</Label>
                <Input
                  id="supplier_name"
                  name="supplier_name"
                  value={(formData as any).supplier_name}
                  onChange={handleChange}
                  placeholder="e.g., Persian Imports Inc"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  name="contact_person"
                  value={(formData as any).contact_person}
                  onChange={handleChange}
                  placeholder="e.g., Ahmed Khan"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={(formData as any).phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="total_debt">Total Debt ($)</Label>
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
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={(formData as any).notes}
              onChange={handleNotesChange}
              placeholder="Add notes about this debt..."
              className="w-full h-16 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Debt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
