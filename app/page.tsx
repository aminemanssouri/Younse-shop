'use client';

import { DollarSign, Package, TrendingUp, Activity } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useSales } from '@/hooks/use-sales';
import { KPICard } from '@/components/kpi-card';
import { SalesChart } from '@/components/sales-chart';
import Navigation from '@/components/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { sales, loading: salesLoading } = useSales();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">{t('dashboard')}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-lg">{t('dashboardSubtitle')}</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <KPICard 
                title={t('totalRevenue')} 
                value={stats.totalRevenue} 
                icon={DollarSign}
                format="currency"
                accent="blue"
              />
              <KPICard 
                title={t('totalProfit')} 
                value={stats.totalProfit} 
                icon={TrendingUp}
                format="currency"
                accent="green"
              />
              <KPICard 
                title={t('productsInStock')} 
                value={stats.totalProducts} 
                icon={Package}
                format="number"
                accent="purple"
              />
              <KPICard 
                title={t('stockValue')} 
                value={stats.totalStockValue} 
                icon={Activity}
                format="currency"
                accent="amber"
              />
            </>
          )}
        </div>

        {/* Chart Section */}
        {salesLoading ? (
          <Skeleton className="h-96" />
        ) : (
          <div className="rounded-lg border border-border bg-card/80 p-4 shadow-sm ring-1 ring-blue-500/10 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground sm:mb-6 sm:text-xl">{t('salesTrend')}</h2>
            <SalesChart sales={sales} />
          </div>
        )}
      </main>
    </div>
  );
}
