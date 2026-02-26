'use client';

import { useState } from 'react';
import { Plus, Calculator } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';
import ProductsTable from '@/components/products-table';
import ProductModal from '@/components/product-modal';
import { SimpleCalculator } from '@/components/simple-calculator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

export default function ProductsPage() {
  const { t } = useLanguage();
  const { products, loading, refetch } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('products')}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t('products')} management</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCalculatorOpen(true)} 
              variant="outline"
              className="gap-2"
            >
              <Calculator className="h-4 w-4" />
              {t('calculator')}
            </Button>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('addProduct')}
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('products')}</CardTitle>
            <CardDescription>{t('manageProducts')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ProductsTable 
                products={products} 
                onEdit={handleEdit}
                onRefresh={refetch}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      <SimpleCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
