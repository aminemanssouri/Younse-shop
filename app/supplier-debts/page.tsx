'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSupplierDebts } from '@/hooks/use-debts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/navigation';
import DebtTable from '@/components/debt-table';
import DebtModal from '@/components/debt-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

export default function SupplierDebtsPage() {
  const { t } = useLanguage();
  const { debts, loading, refetch } = useSupplierDebts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [nameQuery, setNameQuery] = useState('');
  const [contactQuery, setContactQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const filteredDebts = debts.filter((d) => {
    const name = nameQuery.trim().toLowerCase();
    const contact = contactQuery.trim().toLowerCase();
    const phone = phoneQuery.trim().toLowerCase();
    const min = minAmount.trim() === '' ? null : parseFloat(minAmount);
    const max = maxAmount.trim() === '' ? null : parseFloat(maxAmount);

    const matchesName = !name || (d.supplier_name || '').toLowerCase().includes(name);
    const matchesContact = !contact || (d.contact_person || '').toLowerCase().includes(contact);
    const matchesPhone = !phone || (d.phone || '').toLowerCase().includes(phone);

    const amt = d.total_debt || 0;
    const matchesMin = min === null || (!Number.isNaN(min) && amt >= min);
    const matchesMax = max === null || (!Number.isNaN(max) && amt <= max);

    return matchesName && matchesContact && matchesPhone && matchesMin && matchesMax;
  });

  const handleEdit = (debt: any) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedDebt(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedDebt(null);
  };

  const handleSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('supplierDebts')}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t('supplierDebtsSubtitle')}</p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('newSupplierDebt')}
          </Button>
        </div>

        {/* Debts Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('supplierPaymentAccounts')}</CardTitle>
            <CardDescription>{t('supplierPaymentAccountsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-6">
              <Input
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder={t('name')}
              />
              <Input
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                placeholder={t('contactPerson')}
              />
              <Input
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                placeholder={t('phone')}
              />
              <Input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder={t('minAmount')}
              />
              <Input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder={t('maxAmount')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNameQuery('');
                  setContactQuery('');
                  setPhoneQuery('');
                  setMinAmount('');
                  setMaxAmount('');
                }}
              >
                {t('reset')}
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <DebtTable 
                debts={filteredDebts}
                type="supplier"
                onEdit={handleEdit} 
                onRefresh={refetch} 
              />
            )}
          </CardContent>
        </Card>
      </main>

      <DebtModal 
        isOpen={isModalOpen} 
        debt={selectedDebt}
        type="supplier"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
