'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageInput } from './image-input';
import { useLanguage } from '@/contexts/language-context';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ isOpen, product, onClose, onSuccess }: ProductModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity || 0,
    cost_price: product?.cost_price || 0,
    selling_price: product?.selling_price || 0,
    image_url: product?.image_url || null,
    measurement_unit: product?.measurement_unit || 'pce',
    color: product?.color || '#3b82f6',
    notes: product?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('price') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleMeasurementChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      measurement_unit: value,
    }));
  };

  const handleImageChange = (url: string | null) => {
    setFormData(prev => ({
      ...prev,
      image_url: url,
    }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      color: e.target.value,
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
      if (product) {
        await actions.updateProduct(product.id, formData);
      } else {
        await actions.addProduct(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      const message = (error as any)?.message;
      if (message === 'SKU_ALREADY_EXISTS') {
        alert(t('skuAlreadyExists'));
      } else {
        alert(t('saveFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? t('editProduct') : t('addProduct')}</DialogTitle>
          <DialogDescription>
            {product ? t('editProduct') : t('addProduct')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageInput
            value={formData.image_url}
            onChange={handleImageChange}
            label={t('image')}
          />

          <div>
            <Label htmlFor="name">{t('productName')}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('productName')}
              required
            />
          </div>

          <div>
            <Label htmlFor="sku">{t('sku')}</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder={t('sku')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock_quantity">{t('quantity')}</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="measurement_unit">{t('measurement')}</Label>
              <Select value={formData.measurement_unit} onValueChange={handleMeasurementChange}>
                <SelectTrigger id="measurement_unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pce">{t('piece')}</SelectItem>
                  <SelectItem value="m">{t('meter')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost_price">{t('price')} ({t('purchase')})</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                value={formData.cost_price}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="selling_price">{t('price')} ({t('selling')})</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                value={formData.selling_price}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color">{t('color')}</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={handleColorChange}
                className="h-10 w-20 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{formData.color}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t('notes')}</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder={t('productNotesPlaceholder')}
              className="w-full h-20 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('loading') : t('save')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
