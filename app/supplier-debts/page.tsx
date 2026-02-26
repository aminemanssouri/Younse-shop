'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSupplierDebts } from '@/hooks/use-debts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import DebtTable from '@/components/debt-table';
import DebtModal from '@/components/debt-modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupplierDebtsPage() {
  const { debts, loading, refetch } = useSupplierDebts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

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
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Supplier Debts</h1>
            <p className="mt-2 text-lg text-muted-foreground">Track payments owed to suppliers</p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Supplier Debt
          </Button>
        </div>

        {/* Debts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Payment Accounts</CardTitle>
            <CardDescription>View and manage supplier debts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <DebtTable 
                debts={debts}
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
