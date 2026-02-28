'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSales } from '@/hooks/use-sales';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/navigation';
import SalesTable from '@/components/sales-table';
import SaleModal from '@/components/sale-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

export default function SalesPage() {
  const { t } = useLanguage();
  const { sales, loading, refetch } = useSales();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [skuQuery, setSkuQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredSales = sales.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const sku = skuQuery.trim().toLowerCase();

    const productName = ((s as any).product_name || '').toString().toLowerCase();
    const productSku = ((s as any).product_sku || '').toString().toLowerCase();

    const matchesName = !q || productName.includes(q);
    const matchesSku = !sku || productSku.includes(sku);

    const d = new Date(s.sale_date);
    const fromOk = !fromDate || d >= new Date(`${fromDate}T00:00:00`);
    const toOk = !toDate || d <= new Date(`${toDate}T23:59:59`);

    return matchesName && matchesSku && fromOk && toOk;
  });

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
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-5">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('productName')}
              />
              <Input
                value={skuQuery}
                onChange={(e) => setSkuQuery(e.target.value)}
                placeholder={t('sku')}
              />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder={t('fromDate')}
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder={t('toDate')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSkuQuery('');
                  setFromDate('');
                  setToDate('');
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
              <SalesTable sales={filteredSales} onRefresh={refetch} />
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
