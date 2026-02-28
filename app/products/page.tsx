'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/navigation';
import ProductsTable from '@/components/products-table';
import ProductModal from '@/components/product-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

export default function ProductsPage() {
  const { t } = useLanguage();
  const { products, loading, refetch } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [skuQuery, setSkuQuery] = useState('');
  const [colorQuery, setColorQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const sku = skuQuery.trim().toLowerCase();
    const color = colorQuery.trim().toLowerCase();

    const matchesSearch = !q || p.name.toLowerCase().includes(q);
    const matchesSku = !sku || p.sku.toLowerCase().includes(sku);
    const matchesColor =
      !color ||
      (p.color || '').toLowerCase().includes(color) ||
      (p.color || '').toLowerCase() === color;

    return matchesSearch && matchesSku && matchesColor;
  });

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
            <p className="mt-2 text-lg text-muted-foreground">{t('productsSubtitle')}</p>
          </div>
          <div className="flex gap-2">
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
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-4">
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
                value={colorQuery}
                onChange={(e) => setColorQuery(e.target.value)}
                placeholder={t('color')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSkuQuery('');
                  setColorQuery('');
                }}
              >
                {t('reset')}
              </Button>
            </div>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ProductsTable 
                products={filteredProducts} 
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
    </div>
  );
}
