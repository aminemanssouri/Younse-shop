'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import * as actions from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SaleModal({ isOpen, onClose, onSuccess }: SaleModalProps) {
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
      alert('Please select a product');
      return;
    }

    if (formData.quantity_sold <= 0) {
      alert('Quantity must be greater than 0');
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
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error creating sale:', error);
      alert(error instanceof Error ? error.message : 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>
            Create a new sales record and update inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Product</Label>
            <Select value={formData.product_id.toString()} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} (Stock: {product.stock_quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                Cost Price: <span className="font-semibold text-foreground">${selectedProduct.cost_price.toFixed(2)}</span>
              </p>
              <p className="text-muted-foreground">
                Available Stock: <span className="font-semibold text-foreground">{selectedProduct.stock_quantity}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity_sold">Quantity Sold</Label>
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
              <Label htmlFor="selling_price">Selling Price ($)</Label>
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
            <Label htmlFor="sale_date">Sale Date</Label>
            <Input
              id="sale_date"
              name="sale_date"
              type="date"
              value={formData.sale_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder="Add notes about this sale..."
              className="w-full h-16 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {selectedProduct && formData.selling_price > 0 && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                Total Amount: <span className="font-semibold">${(formData.quantity_sold * formData.selling_price).toFixed(2)}</span>
              </p>
              <p className="text-sm text-blue-900">
                Expected Profit: <span className="font-semibold text-green-600">
                  ${((formData.selling_price - selectedProduct.cost_price) * formData.quantity_sold).toFixed(2)}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedProduct}>
              {loading ? 'Recording...' : 'Record Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
