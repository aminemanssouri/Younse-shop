'use client';

import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Eye } from 'lucide-react';
import Image from 'next/image';
import * as actions from '@/app/actions';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';
import { DetailsDialog } from '@/components/details-dialog';
import { useState } from 'react';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export default function ProductsTable({ products, onEdit, onRefresh }: ProductsTableProps) {
  const { t, language } = useLanguage();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
      await actions.deleteProduct(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(t('saveFailed'));
    }
  };

  const getMeasurementLabel = (unit?: string) => {
    if (unit === 'm') return t('meter');
    return t('piece');
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-foreground">{t('image')}</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">{t('productName')}</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">SKU</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">Color</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">{t('measurement')}</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">{t('quantity')}</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">{t('price')}</th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">{t('close')}</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                {t('noData')}
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  {product.image_url ? (
                    <div className="relative w-12 h-12 rounded-md overflow-hidden">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      {t('noImage')}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{product.sku}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: product.color || '#3b82f6' }}
                      title={product.color}
                    />
                    <span className="text-xs text-muted-foreground">{product.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-xs bg-muted/30 rounded">
                  {getMeasurementLabel(product.measurement_unit)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    product.stock_quantity > 0 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold">
                  {displayPrice(product.selling_price, language)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(product)}
                      className="text-muted-foreground hover:text-foreground"
                      title={t('view')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
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
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('productName')}</p>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">SKU</p>
                <p className="font-medium">{selectedProduct.sku}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('quantity')}</p>
                <p className="font-medium">{selectedProduct.stock_quantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('measurement')}</p>
                <p className="font-medium">{getMeasurementLabel(selectedProduct.measurement_unit)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('price')} ({t('purchase')})</p>
                <p className="font-medium">{displayPrice(selectedProduct.cost_price, language)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('price')} ({t('selling')})</p>
                <p className="font-medium">{displayPrice(selectedProduct.selling_price, language)}</p>
              </div>
            </div>

            {selectedProduct.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{selectedProduct.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailsDialog>
    </div>
  );
}
