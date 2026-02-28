'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';
import Image from 'next/image';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SaleModal({ isOpen, onClose, onSuccess }: SaleModalProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    sale_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await actions.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const handleProductChange = (value: string) => {
    const product = products.find(p => p.id === parseInt(value));
    setSelectedProduct(product || null);
    setFormData(prev => ({
      ...prev,
      product_id: parseInt(value),
      selling_price: product?.selling_price || 0,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('price') 
        ? parseFloat(value) || 0 
        : value,
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
    
    if (!selectedProduct) {
      alert(t('pleaseSelectProduct'));
      return;
    }

    if (formData.quantity_sold <= 0) {
      alert(t('quantityMustBeGreaterThanZero'));
      return;
    }

    setLoading(true);

    try {
      const totalAmount = formData.quantity_sold * formData.selling_price;
      
      await actions.addSale({
        product_id: formData.product_id,
        quantity_sold: formData.quantity_sold,
        selling_price: formData.selling_price,
        total_amount: totalAmount,
        profit_amount: 0, // Calculated in server action
        sale_date: new Date(formData.sale_date).toISOString(),
      });

      onSuccess();
      setFormData({
        product_id: 0,
        quantity_sold: 1,
        selling_price: 0,
        sale_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error creating sale:', error);
      alert(error instanceof Error ? error.message : t('failedToCreateSale'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('recordNewSale')}</DialogTitle>
          <DialogDescription>
            {t('recordNewSaleDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">{t('product')}</Label>
            <Select value={formData.product_id.toString()} onValueChange={handleProductChange}>
              <SelectTrigger>
                {selectedProduct ? (
                  <div className="flex items-center gap-2">
                    {selectedProduct.image_url ? (
                      <Image
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        width={22}
                        height={22}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="h-[22px] w-[22px] rounded bg-muted" />
                    )}
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{selectedProduct.name}</span>
                      <span className="text-xs text-muted-foreground">{t('stock')}: {selectedProduct.stock_quantity}</span>
                    </div>
                  </div>
                ) : (
                  <SelectValue placeholder={t('selectProduct')} />
                )}
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    <div className="flex items-center gap-2">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={22}
                          height={22}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="h-[22px] w-[22px] rounded bg-muted" />
                      )}
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">{t('stock')}: {product.stock_quantity}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                {t('costPrice')}: <span className="font-semibold text-foreground">{displayPrice(selectedProduct.cost_price, language)}</span>
              </p>
              <p className="text-muted-foreground">
                {t('availableStock')}: <span className="font-semibold text-foreground">{selectedProduct.stock_quantity}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity_sold">{t('quantitySold')}</Label>
              <Input
                id="quantity_sold"
                name="quantity_sold"
                type="number"
                value={formData.quantity_sold}
                onChange={handleChange}
                min="1"
                max={selectedProduct?.stock_quantity || 0}
              />
            </div>

            <div>
              <Label htmlFor="selling_price">{t('sellingPrice')}</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sale_date">{t('saleDate')}</Label>
            <Input
              id="sale_date"
              name="sale_date"
              type="date"
              value={formData.sale_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="notes">{t('notes')}</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder={t('saleNotesPlaceholder')}
              className="w-full h-16 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {selectedProduct && formData.selling_price > 0 && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                {t('totalAmount')}: <span className="font-semibold">{displayPrice(formData.quantity_sold * formData.selling_price, language)}</span>
              </p>
              <p className="text-sm text-blue-900">
                {t('expectedProfit')}: <span className="font-semibold text-green-600">
                  {displayPrice((formData.selling_price - selectedProduct.cost_price) * formData.quantity_sold, language)}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !selectedProduct}>
              {loading ? t('recording') : t('recordSale')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
