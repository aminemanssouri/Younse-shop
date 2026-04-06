'use client';

import { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageInput } from './image-input';
import { useLanguage } from '@/contexts/language-context';
import { Plus, Trash2 } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ isOpen, product, onClose, onSuccess }: ProductModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    cost_price: product?.cost_price || 0,
    selling_price: product?.selling_price || 0,
    image_url: product?.image_url || null,
    measurement_unit: product?.measurement_unit || 'pce',
    notes: product?.notes || '',
  });
  
  // Color variants with individual stock
  const [variants, setVariants] = useState<Array<{ color: string; stock_quantity: number; id?: number }>>([
    { color: 'red', stock_quantity: 0 }
  ]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        cost_price: product.cost_price || 0,
        selling_price: product.selling_price || 0,
        image_url: product.image_url || null,
        measurement_unit: product.measurement_unit || 'pce',
        notes: product.notes || '',
      });
      // Load existing variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map(v => ({
          id: v.id,
          color: v.color,
          stock_quantity: v.stock_quantity
        })));
      } else {
        setVariants([{ color: product.color || 'red', stock_quantity: product.stock_quantity || 0 }]);
      }
    } else {
      setFormData({
        name: '',
        sku: '',
        cost_price: 0,
        selling_price: 0,
        image_url: null,
        measurement_unit: 'pce',
        notes: '',
      });
      setVariants([{ color: 'red', stock_quantity: 0 }]);
    }
    setErrorMessage(null);
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrorMessage(null);
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('price') 
        ? (value === '' ? 0 : parseFloat(value) || 0)
        : value,
    }));
  };

  const handleMeasurementChange = (value: string) => {
    setErrorMessage(null);
    setFormData(prev => ({
      ...prev,
      measurement_unit: value,
    }));
  };

  const handleImageChange = (url: string | null) => {
    setErrorMessage(null);
    setFormData(prev => ({
      ...prev,
      image_url: url,
    }));
  };

  const addVariant = () => {
    setVariants([...variants, { color: '', stock_quantity: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: 'color' | 'stock_quantity', value: string | number) => {
    const newVariants = [...variants];
    if (field === 'stock_quantity') {
      newVariants[index][field] = typeof value === 'string' ? (value === '' ? 0 : parseFloat(value) || 0) : value;
    } else {
      newVariants[index][field] = value as string;
    }
    setVariants(newVariants);
  };

  const isValidColor = (color: string): boolean => {
    if (!color) return false;
    
    // Check if it's a valid hex code
    const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
    if (hexPattern.test(color)) return true;
    
    // Check if it's a valid CSS color name by testing it in a temporary element
    const testElement = document.createElement('div');
    testElement.style.color = color;
    return testElement.style.color !== '';
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setErrorMessage(null);
    setFormData(prev => ({
      ...prev,
      notes: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Validate variants
    if (variants.length === 0) {
      setErrorMessage(t('pleaseAddAtLeastOneColor'));
      setLoading(false);
      return;
    }

    for (const variant of variants) {
      if (!variant.color || variant.color.trim() === '') {
        setErrorMessage(t('allColorsMustBeSpecified'));
        setLoading(false);
        return;
      }
    }

    try {
      if (product) {
        // Update existing product
        await actions.updateProduct(product.id, formData);
        
        // Update variants
        const existingVariantIds = product.variants?.map(v => v.id) || [];
        const currentVariantIds = variants.filter(v => v.id).map(v => v.id!);
        
        // Delete removed variants
        for (const id of existingVariantIds) {
          if (!currentVariantIds.includes(id)) {
            await actions.deleteProductVariant(id);
          }
        }
        
        // Update or add variants
        for (const variant of variants) {
          if (variant.id) {
            await actions.updateProductVariant(variant.id, {
              color: variant.color,
              stock_quantity: variant.stock_quantity
            });
          } else {
            await actions.addProductVariant({
              product_id: product.id,
              color: variant.color,
              stock_quantity: variant.stock_quantity
            });
          }
        }
      } else {
        // Create new product
        const productData = { ...formData, stock_quantity: 0 };
        await actions.addProduct(productData);
        
        // Get the newly created product to add variants
        const products = await actions.getProducts();
        const newProduct = products.find(p => p.sku === formData.sku);
        
        if (newProduct) {
          for (const variant of variants) {
            await actions.addProductVariant({
              product_id: newProduct.id,
              color: variant.color,
              stock_quantity: variant.stock_quantity
            });
          }
        }
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      const message = String((error as any)?.message || '');
      if (message.includes('SKU_ALREADY_EXISTS')) {
        setErrorMessage(t('skuAlreadyExists'));
      } else {
        setErrorMessage(t('saveFailed'));
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
          {errorMessage && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
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
            <div className="flex items-center justify-between mb-2">
              <Label>{t('colorVariants')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" />
                {t('addColor')}
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {variants.map((variant, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder={t('color')}
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input
                    type="number"
                    placeholder={t('stock')}
                    value={variant.stock_quantity}
                    onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                    step="0.01"
                    className="w-32"
                    required
                  />
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('colorVariantsHint')}
            </p>
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
