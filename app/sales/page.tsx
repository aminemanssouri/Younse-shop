'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSales } from '@/hooks/use-sales';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import SalesTable from '@/components/sales-table';
import SaleModal from '@/components/sale-modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function SalesPage() {
  const { sales, loading, refetch } = useSales();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNew = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Sales</h1>
            <p className="mt-2 text-lg text-muted-foreground">Track your sales transactions</p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Sale
          </Button>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Records</CardTitle>
            <CardDescription>View all sales transactions with revenue and profit details</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <SalesTable sales={sales} onRefresh={refetch} />
            )}
          </CardContent>
        </Card>
      </main>

      <SaleModal 
        isOpen={isModalOpen} 
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
