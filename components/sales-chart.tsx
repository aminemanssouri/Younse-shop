'use client';

import { Sale } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';

interface SalesChartProps {
  sales: Sale[];
}

export function SalesChart({ sales }: SalesChartProps) {
  const { t, language } = useLanguage();
  // Group sales by date
  const chartData = (sales && sales.length > 0) ? sales.reduce((acc, sale) => {
    const date = new Date(sale.sale_date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.revenue += sale.total_amount;
      existing.profit += sale.profit_amount;
    } else {
      acc.push({
        date,
        revenue: sale.total_amount,
        profit: sale.profit_amount,
      });
    }
    
    return acc;
  }, [] as Array<{ date: string; revenue: number; profit: number }>) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('salesTrendsTitle')}</CardTitle>
        <CardDescription>{t('salesTrendsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: any) => displayPrice(typeof value === 'number' ? value : parseFloat(value), language)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
