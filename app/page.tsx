'use client';

import { DollarSign, Package, TrendingUp, Activity, Download, Calendar, CalendarDays } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { sales, loading: salesLoading, refetch: refetchSales } = useSales();
  const [downloading, setDownloading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedQuickRange, setSelectedQuickRange] = useState('');

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
    // Open window IMMEDIATELY (before any async) to avoid popup blocker
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(t('downloadFailed') + ': Popup blocked. Please allow popups for this site.');
      return;
    }
    
    setDownloading(true);
    try {
      const { getDailySalesReportByDate } = await import('@/app/actions');
      const report = await getDailySalesReportByDate(dateStr);
      console.log('Report data:', report);

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
                <th>${t('saleStatus')}</th>
                <th>${t('amountPaid')}</th>
                <th>${t('remainingDebt')}</th>
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
                  <td>${sale.status === 'completed' ? t('saleCompleted') : t('salePending')}</td>
                  <td>${formatCurrency(sale.amount_paid)}</td>
                  <td style="${sale.remaining_debt > 0 ? 'color: #dc2626; font-weight: bold;' : ''}">${formatCurrency(sale.remaining_debt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${report.charges.length > 0 ? `
          <h2 style="margin-top: 30px; font-size: 18px;">${t('charges')}</h2>
          <table>
            <thead>
              <tr>
                <th>${t('chargeName')}</th>
                <th>${t('chargeAmount')}</th>
              </tr>
            </thead>
            <tbody>
              ${report.charges.map(charge => `
                <tr>
                  <td>${charge.name}</td>
                  <td style="color: #dc2626;">${formatCurrency(charge.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}

          <div class="summary">
            <div class="summary-item">
              <span>${t('totalRevenue')}:</span>
              <strong>${formatCurrency(report.totalRevenue)}</strong>
            </div>
            <div class="summary-item">
              <span>${t('totalCost')}:</span>
              <strong>${formatCurrency(report.totalCost)}</strong>
            </div>
            <div class="summary-item">
              <span>${t('totalProfit')}:</span>
              <strong>${formatCurrency(report.totalProfit)}</strong>
            </div>
            ${report.totalCharges > 0 ? `
            <div class="summary-item" style="color: #dc2626;">
              <span>${t('totalCharges')}:</span>
              <strong>-${formatCurrency(report.totalCharges)}</strong>
            </div>
            <div class="summary-item total" style="border-top: 2px solid #333; padding-top: 10px;">
              <span>Net Profit:</span>
              <strong>${formatCurrency(report.netProfit)}</strong>
            </div>
            ` : `
            <div class="summary-item total">
              <span>${t('totalProfit')}:</span>
              <strong>${formatCurrency(report.totalProfit)}</strong>
            </div>
            `}
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
      alert(t('downloadFailed') + ': ' + (error instanceof Error ? error.message : String(error)));
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

  const downloadReportForDateRange = async (start: string, end: string) => {
    // Open window IMMEDIATELY (before any async) to avoid popup blocker
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(t('downloadFailed') + ': Popup blocked. Please allow popups for this site.');
      return;
    }
    
    setDownloading(true);
    try {
      const { getSalesReportByDateRange } = await import('@/app/actions');
      const report = await getSalesReportByDateRange(start, end);
      console.log('Date range report data:', report);

      const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
      const formattedStartDate = new Date(report.startDate).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedEndDate = new Date(report.endDate).toLocaleDateString(locale, {
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
          <title>${t('dateRangeReport')} - ${formattedStartDate} ${t('to')} ${formattedEndDate}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .date-range { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; }
            .summary { margin-top: 20px; }
            .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .summary-item strong { font-weight: bold; }
            .total { font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #333; }
            .daily-breakdown { margin-top: 30px; }
            .daily-breakdown h2 { font-size: 18px; margin-bottom: 15px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${t('dateRangeReport')}</h1>
          <div class="date-range">${formattedStartDate} ${t('to')} ${formattedEndDate}</div>
          
          <table>
            <thead>
              <tr>
                <th>${t('product')}</th>
                <th>${t('quantity')}</th>
                <th>${t('unitPrice')}</th>
                <th>${t('totalAmount')}</th>
                <th>${t('profit')}</th>
                <th>${t('saleStatus')}</th>
                <th>${t('amountPaid')}</th>
                <th>${t('remainingDebt')}</th>
                <th>${t('date')}</th>
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
                  <td>${sale.status === 'completed' ? t('saleCompleted') : t('salePending')}</td>
                  <td>${formatCurrency(sale.amount_paid)}</td>
                  <td style="${sale.remaining_debt > 0 ? 'color: #dc2626; font-weight: bold;' : ''}">${formatCurrency(sale.remaining_debt)}</td>
                  <td>${new Date(sale.sale_date).toLocaleDateString(locale)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${report.charges.length > 0 ? `
          <h2 style="margin-top: 30px; font-size: 18px;">${t('charges')}</h2>
          <table>
            <thead>
              <tr>
                <th>${t('chargeName')}</th>
                <th>${t('chargeAmount')}</th>
                <th>${t('date')}</th>
              </tr>
            </thead>
            <tbody>
              ${report.charges.map(charge => `
                <tr>
                  <td>${charge.name}</td>
                  <td style="color: #dc2626;">${formatCurrency(charge.amount)}</td>
                  <td>${new Date(charge.charge_date).toLocaleDateString(locale)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}

          <div class="daily-breakdown">
            <h2>${t('dailyBreakdown')}</h2>
            <table>
              <thead>
                <tr>
                  <th>${t('date')}</th>
                  <th>${t('totalRevenue')}</th>
                  <th>${t('totalProfit')}</th>
                  <th>${t('totalSales')}</th>
                </tr>
              </thead>
              <tbody>
                ${report.dayBreakdown.map(day => `
                  <tr>
                    <td>${new Date(day.date).toLocaleDateString(locale)}</td>
                    <td>${formatCurrency(day.revenue)}</td>
                    <td>${formatCurrency(day.profit)}</td>
                    <td>${day.salesCount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="summary">
            <div class="summary-item">
              <span>${t('totalRevenue')}:</span>
              <strong>${formatCurrency(report.totalRevenue)}</strong>
            </div>
            <div class="summary-item">
              <span>${t('totalCost')}:</span>
              <strong>${formatCurrency(report.totalCost)}</strong>
            </div>
            <div class="summary-item">
              <span>${t('totalProfit')}:</span>
              <strong>${formatCurrency(report.totalProfit)}</strong>
            </div>
            ${report.totalCharges > 0 ? `
            <div class="summary-item" style="color: #dc2626;">
              <span>${t('totalCharges')}:</span>
              <strong>-${formatCurrency(report.totalCharges)}</strong>
            </div>
            <div class="summary-item total" style="border-top: 2px solid #333; padding-top: 10px;">
              <span>Net Profit:</span>
              <strong>${formatCurrency(report.netProfit)}</strong>
            </div>
            ` : `
            <div class="summary-item total">
              <span>${t('totalProfit')}:</span>
              <strong>${formatCurrency(report.totalProfit)}</strong>
            </div>
            `}
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
      alert(t('downloadFailed') + ': ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadDateRange = () => {
    downloadReportForDateRange(startDate, endDate);
    setIsDateRangePickerOpen(false);
  };

  const handleQuickRangeSelect = async (rangeKey: string) => {
    setSelectedQuickRange(rangeKey);
    try {
      const { getCommonDateRanges } = await import('@/app/actions');
      const ranges = await getCommonDateRanges();
      
      let start = '';
      let end = '';
      
      switch (rangeKey) {
        case 'today':
          start = end = ranges.today;
          break;
        case 'yesterday':
          start = end = ranges.yesterday;
          break;
        case 'last7Days':
          start = ranges.last7Days.start;
          end = ranges.last7Days.end;
          break;
        case 'last10Days':
          start = ranges.last10Days.start;
          end = ranges.last10Days.end;
          break;
        case 'last30Days':
          start = ranges.last30Days.start;
          end = ranges.last30Days.end;
          break;
        case 'thisMonth':
          start = ranges.thisMonth.start;
          end = ranges.thisMonth.end;
          break;
        case 'lastMonth':
          start = ranges.lastMonth.start;
          end = ranges.lastMonth.end;
          break;
      }
      
      if (start && end) {
        setStartDate(start);
        setEndDate(end);
      }
    } catch (error) {
      console.error('Error getting date ranges:', error);
    }
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
              <Dialog open={isDateRangePickerOpen} onOpenChange={setIsDateRangePickerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={downloading} className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('selectDateRange')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('downloadRangeReport')}</DialogTitle>
                    <DialogDescription>
                      {t('selectDateRangeToDownload')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Quick Range Selection */}
                    <div>
                      <Label>{t('quickRanges')}</Label>
                      <Select value={selectedQuickRange} onValueChange={handleQuickRangeSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectDateRange')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">{t('today')}</SelectItem>
                          <SelectItem value="yesterday">{t('yesterday')}</SelectItem>
                          <SelectItem value="last7Days">{t('last7Days')}</SelectItem>
                          <SelectItem value="last10Days">{t('last10Days')}</SelectItem>
                          <SelectItem value="last30Days">{t('last30Days')}</SelectItem>
                          <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
                          <SelectItem value="lastMonth">{t('lastMonth')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">{t('startDate')}</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">{t('endDate')}</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          min={startDate}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleDownloadDateRange} 
                      disabled={downloading || !startDate || !endDate || startDate > endDate} 
                      className="w-full"
                    >
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
