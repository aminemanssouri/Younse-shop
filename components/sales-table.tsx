'use client';

import { Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';
import { DetailsDialog } from '@/components/details-dialog';
import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';
import * as actions from '@/app/actions';

interface SalesTableProps {
  sales: Sale[];
  onRefresh: () => void;
}

export default function SalesTable({ sales, onRefresh }: SalesTableProps) {
  const { t, language } = useLanguage();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setIsViewOpen(true);
  };

  const handleCancelSale = async (sale: Sale) => {
    const ok = window.confirm(t('confirmCancelSale'));
    if (!ok) return;

    try {
      setCancelingId(sale.id);
      await actions.cancelSale(sale.id);
      onRefresh();
    } catch (e: any) {
      alert(e?.message || t('error'));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-foreground">{t('product')}</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">{t('quantity')}</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">{t('unitPrice')}</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">{t('totalPrice')}</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">{t('profit')}</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">{t('saleDate')}</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">{t('view')}</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">{t('cancelSale')}</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                {t('noSalesRecords')}
              </td>
            </tr>
          ) : (
            sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{(sale as any).product_name || t('product')}</p>
                    <p className="text-xs text-muted-foreground">{(sale as any).product_sku || t('sku')}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-foreground">{sale.quantity_sold}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {displayPrice(sale.selling_price, language)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  {displayPrice(sale.total_amount, language)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">
                    {displayPrice(sale.profit_amount, language)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(sale.sale_date)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(sale)}
                    title={t('view')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelSale(sale)}
                    disabled={cancelingId === sale.id}
                    title={t('cancelSale')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
        {selectedSale && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('product')}</p>
              <p className="font-medium">{(selectedSale as any).product_name || selectedSale.product_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('quantity')}</p>
              <p className="font-medium">{selectedSale.quantity_sold}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('unitPrice')}</p>
              <p className="font-medium">{displayPrice(selectedSale.selling_price, language)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('totalAmount')}</p>
              <p className="font-medium">{displayPrice(selectedSale.total_amount, language)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('profit')}</p>
              <p className="font-medium">{displayPrice(selectedSale.profit_amount, language)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('saleDate')}</p>
              <p className="font-medium">{formatDate(selectedSale.sale_date)}</p>
            </div>
            {selectedSale.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground">{t('notes')}</p>
                <p className="whitespace-pre-wrap">{selectedSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailsDialog>
    </div>
  );
}
