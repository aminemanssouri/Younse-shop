'use client';

import { DollarSign, Package, TrendingUp, Activity, Download, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useSales } from '@/hooks/use-sales';
import { KPICard } from '@/components/kpi-card';
import { SalesChart } from '@/components/sales-chart';
import Navigation from '@/components/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { sales, loading: salesLoading, refetch: refetchSales } = useSales();
  const [downloading, setDownloading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Auto-refresh dashboard every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchSales();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetchStats, refetchSales]);

  // Refresh when page becomes visible (e.g., returning from sales page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchStats();
        refetchSales();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchStats, refetchSales]);

  const downloadReportForDate = async (dateStr: string) => {
    setDownloading(true);
    try {
      const { getDailySalesReportByDate } = await import('@/app/actions');
      const report = await getDailySalesReportByDate(dateStr);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert(t('downloadFailed'));
        return;
      }

      const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
      const formattedDate = new Date(report.date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'MAD',
          minimumFractionDigits: 2,
        }).format(amount).replace('MAD', 'DH');
      };

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${t('dailySalesReport')} - ${formattedDate}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .date { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; }
            .summary { margin-top: 20px; }
            .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .summary-item strong { font-weight: bold; }
            .total { font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #333; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${t('dailySalesReport')}</h1>
          <div class="date">${formattedDate}</div>
          
          <table>
            <thead>
              <tr>
                <th>${t('product')}</th>
                <th>${t('quantity')}</th>
                <th>${t('unitPrice')}</th>
                <th>${t('totalAmount')}</th>
                <th>${t('profit')}</th>
              </tr>
            </thead>
            <tbody>
              ${report.sales.map(sale => `
                <tr>
                  <td>${sale.product_name}</td>
                  <td>${sale.quantity_sold}</td>
                  <td>${formatCurrency(sale.selling_price)}</td>
                  <td>${formatCurrency(sale.total_amount)}</td>
                  <td>${formatCurrency(sale.profit_amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-item">
              <span>${t('totalRevenue')}:</span>
              <strong>${formatCurrency(report.totalRevenue)}</strong>
            </div>
            <div class="summary-item">
              <span>${t('totalCost')}:</span>
              <strong>${formatCurrency(report.totalCost)}</strong>
            </div>
            <div class="summary-item total">
              <span>${t('totalProfit')}:</span>
              <strong>${formatCurrency(report.totalProfit)}</strong>
            </div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(t('downloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadToday = () => {
    const today = new Date().toISOString().split('T')[0];
    downloadReportForDate(today);
  };

  const handleDownloadSelectedDate = () => {
    downloadReportForDate(selectedDate);
    setIsDatePickerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">{t('dashboard')}</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-lg">{t('dashboardSubtitle')}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadToday} disabled={downloading} className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{downloading ? t('downloading') : t('downloadPDF')}</span>
              </Button>
              <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={downloading} className="gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('selectDate')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('downloadReportForDate')}</DialogTitle>
                    <DialogDescription>
                      {t('selectDateToDownload')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="report-date">{t('date')}</Label>
                      <Input
                        id="report-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <Button onClick={handleDownloadSelectedDate} disabled={downloading} className="w-full">
                      {downloading ? t('downloading') : t('download')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
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
                title={t('dailyRevenue')} 
                value={stats.totalRevenue} 
                icon={DollarSign}
                format="currency"
                accent="blue"
              />
              <KPICard 
                title={t('dailyProfit')} 
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
