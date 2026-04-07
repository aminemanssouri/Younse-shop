'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: 0,
    variant_id: undefined as number | undefined,
    quantity_sold: 1,
    total_price: 0,
    sale_date: new Date().toISOString().split('T')[0],
    status: 'completed' as 'completed' | 'pending',
    amount_paid: 0,
    notes: '',
  });

  // Calculate price per unit from total price
  const pricePerUnit = formData.quantity_sold > 0 ? formData.total_price / formData.quantity_sold : 0;
  // Calculate remaining debt
  const remainingDebt = formData.status === 'pending' ? Math.max(0, formData.total_price - formData.amount_paid) : 0;

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
    setSelectedVariantId(null);
    setFormData(prev => ({
      ...prev,
      product_id: parseInt(value),
      variant_id: undefined,
      total_price: product?.selling_price || 0,
    }));
  };

  const handleVariantChange = (value: string) => {
    const variantId = parseInt(value);
    setSelectedVariantId(variantId);
    setFormData(prev => ({
      ...prev,
      variant_id: variantId,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('price') || name === 'amount_paid'
        ? (value === '' ? 0 : parseFloat(value) || 0)
        : value,
    }));
  };

  const handleStatusChange = (value: string) => {
    const status = value as 'completed' | 'pending';
    setFormData(prev => ({
      ...prev,
      status,
      amount_paid: status === 'completed' ? prev.total_price : prev.amount_paid,
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

    if (selectedProduct.variants && selectedProduct.variants.length > 0 && !selectedVariantId) {
      alert(t('pleaseSelectColor'));
      return;
    }

    if (formData.quantity_sold <= 0) {
      alert(t('quantityMustBeGreaterThanZero'));
      return;
    }

    // Check stock availability
    const availableStock = selectedVariantId 
      ? (selectedProduct.variants?.find(v => v.id === selectedVariantId)?.stock_quantity || 0)
      : selectedProduct.stock_quantity;
    
    if (formData.quantity_sold > availableStock) {
      alert(`${t('insufficientStock')}. ${t('availableStock')}: ${availableStock}`);
      return;
    }

    setLoading(true);

    try {
      const amountPaid = formData.status === 'completed' ? formData.total_price : formData.amount_paid;
      await actions.addSale({
        product_id: formData.product_id,
        variant_id: formData.variant_id,
        quantity_sold: formData.quantity_sold,
        selling_price: pricePerUnit,
        total_amount: formData.total_price,
        profit_amount: 0, // Calculated in server action
        sale_date: new Date(formData.sale_date).toISOString(),
        status: formData.status,
        amount_paid: amountPaid,
        remaining_debt: formData.total_price - amountPaid,
      });

      onSuccess();
      setFormData({
        product_id: 0,
        variant_id: undefined,
        quantity_sold: 1,
        total_price: 0,
        sale_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        amount_paid: 0,
        notes: '',
      });
      setSelectedProduct(null);
      setSelectedVariantId(null);
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

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="sale_date">{t('saleDate')}</Label>
            <Input
              id="sale_date"
              name="sale_date"
              type="date"
              value={formData.sale_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="product">{t('product')}</Label>
            <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={productSearchOpen}
                  className="w-full justify-between h-auto min-h-10 font-normal"
                >
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
                      <div className="flex flex-col leading-tight text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{selectedProduct.name}</span>
                          {selectedProduct.color && (
                            <div 
                              className="h-3 w-3 rounded-full border border-gray-300" 
                              style={{ backgroundColor: selectedProduct.color }}
                              title={selectedProduct.color}
                            />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{t('stock')}: {selectedProduct.stock_quantity}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{t('selectProduct')}</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command filter={(value, search) => {
                  const product = products.find(p => p.id.toString() === value);
                  if (!product) return 0;
                  const text = `${product.name} ${product.sku || ''} ${product.color || ''}`.toLowerCase();
                  return text.includes(search.toLowerCase()) ? 1 : 0;
                }}>
                  <CommandInput placeholder={t('searchProduct')} />
                  <CommandList>
                    <CommandEmpty>{t('noProductsFound')}</CommandEmpty>
                    <CommandGroup>
                      {products.map(product => (
                        <CommandItem
                          key={product.id}
                          value={product.id.toString()}
                          onSelect={(value) => {
                            handleProductChange(value);
                            setProductSearchOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedProduct?.id === product.id ? "opacity-100" : "opacity-0")} />
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
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium">{product.name}</span>
                                {product.color && (
                                  <div 
                                    className="h-3 w-3 rounded-full border border-gray-300" 
                                    style={{ backgroundColor: product.color }}
                                    title={product.color}
                                  />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {t('stock')}: {product.stock_quantity} | {t('sku')}: {product.sku}
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div>
              <Label htmlFor="variant">{t('selectColor')}</Label>
              <Select value={selectedVariantId?.toString() || ''} onValueChange={handleVariantChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectColor')} />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.variants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 w-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: variant.color }}
                        />
                        <span>{variant.color}</span>
                        <span className="text-xs text-muted-foreground">({t('stock')}: {variant.stock_quantity})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedProduct && selectedVariantId && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                {t('availableStock')}: <span className="font-semibold text-foreground">{selectedProduct.variants?.find(v => v.id === selectedVariantId)?.stock_quantity || 0}</span>
              </p>
            </div>
          )}

          {selectedProduct && (!selectedProduct.variants || selectedProduct.variants.length === 0) && (
            <div className="rounded-lg bg-muted p-3 text-sm">
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
                min="0.01"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="total_price">{t('totalPrice')}</Label>
              <Input
                id="total_price"
                name="total_price"
                type="number"
                step="0.01"
                value={formData.total_price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 p-3 text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('pricePerUnit')}:</span>
              <span className="font-semibold text-lg">
                {pricePerUnit.toFixed(2)} MAD / {selectedProduct?.measurement_unit === 'm' ? t('meter') : t('piece')}
              </span>
            </div>
            {selectedProduct && (
              <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                <span className="text-muted-foreground">{t('expectedProfit')}:</span>
                <span className="font-semibold text-green-600">
                  {((pricePerUnit - selectedProduct.cost_price) * formData.quantity_sold).toFixed(2)} MAD
                </span>
              </div>
            )}
          </div>

          <div>
            <Label>{t('saleStatus')}</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">{t('saleCompleted')}</SelectItem>
                <SelectItem value="pending">{t('salePending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'pending' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="amount_paid">{t('amountPaid')}</Label>
                <Input
                  id="amount_paid"
                  name="amount_paid"
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.total_price}
                  value={formData.amount_paid}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-red-700 dark:text-red-400 font-medium">{t('remainingDebt')}:</span>
                  <span className="font-bold text-lg text-red-600 dark:text-red-400">
                    {remainingDebt.toFixed(2)} MAD
                  </span>
                </div>
              </div>
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
