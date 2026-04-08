'use client';

import { useState } from 'react';
import { Plus, Receipt, Pencil, Trash2 } from 'lucide-react';
import { useSales } from '@/hooks/use-sales';
import { Charge } from '@/lib/types';
import * as actions from '@/app/actions';
import { useCharges } from '@/hooks/use-charges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Navigation from '@/components/navigation';
import SalesTable from '@/components/sales-table';
import SaleModal from '@/components/sale-modal';
import ChargeModal from '@/components/charge-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

export default function SalesPage() {
  const { t } = useLanguage();
  const { sales, loading, refetch } = useSales();
  const { charges, loading: chargesLoading, refetch: refetchCharges } = useCharges();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('sales')}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t('salesSubtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="sales" className="w-full">
          <div className="flex items-center justify-between mb-4 gap-4">
            <TabsList>
              <TabsTrigger value="sales">{t('sales')}</TabsTrigger>
              <TabsTrigger value="charges">
                {t('charges')} ({charges.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="mt-0 data-[state=inactive]:hidden">
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('newSale')}
              </Button>
            </TabsContent>
            <TabsContent value="charges" className="mt-0 data-[state=inactive]:hidden">
              <Button onClick={() => setIsChargeModalOpen(true)} variant="outline" className="gap-2">
                <Receipt className="h-4 w-4" />
                {t('addCharge')}
              </Button>
            </TabsContent>
          </div>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>{t('salesRecords')}</CardTitle>
                <CardDescription>{t('salesRecordsDescription')}</CardDescription>
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
          </TabsContent>

          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <CardTitle>{t('charges')}</CardTitle>
                <CardDescription>{t('totalCharges')}: {charges.reduce((sum, c) => sum + (c.amount || 0), 0).toFixed(2)} MAD</CardDescription>
              </CardHeader>
              <CardContent>
                {chargesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                ) : charges.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">{t('noCharges')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">{t('chargeDate')}</th>
                          <th className="text-left py-3 px-2">{t('chargeName')}</th>
                          <th className="text-left py-3 px-2">{t('chargeAmount')}</th>
                          <th className="text-left py-3 px-2">{t('chargeNotes')}</th>
                          <th className="text-left py-3 px-2">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {charges.map((charge) => (
                          <tr key={charge.id} className="border-b">
                            <td className="py-3 px-2">{new Date(charge.charge_date).toLocaleDateString()}</td>
                            <td className="py-3 px-2">{charge.name}</td>
                            <td className="py-3 px-2 text-red-600 font-medium">{charge.amount.toFixed(2)} MAD</td>
                            <td className="py-3 px-2 text-muted-foreground">{charge.notes || '-'}</td>
                            <td className="py-3 px-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCharge(charge);
                                    setIsChargeModalOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={async () => {
                                    if (confirm(t('deleteConfirm') || 'Are you sure you want to delete this charge?')) {
                                      try {
                                        await actions.deleteCharge(charge.id);
                                        refetchCharges();
                                      } catch (error) {
                                        alert(error instanceof Error ? error.message : t('error'));
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <SaleModal 
        isOpen={isModalOpen} 
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      <ChargeModal
        isOpen={isChargeModalOpen}
        onClose={() => {
          setIsChargeModalOpen(false);
          setEditingCharge(null);
        }}
        onSuccess={() => {
          refetchCharges();
          setEditingCharge(null);
        }}
        charge={editingCharge}
      />
    </div>
  );
}
