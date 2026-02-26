'use client';

import { LucideIcon } from 'lucide-react';
import { displayPrice } from '@/lib/currency';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  format?: 'currency' | 'number' | 'default';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, format = 'default', trend }: KPICardProps) {
  const formattedValue = 
    format === 'currency'
      ? displayPrice(typeof value === 'number' ? value : parseFloat(value))
      : format === 'number' && typeof value === 'number'
      ? value.toLocaleString()
      : value;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{formattedValue}</h3>
            {trend && (
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
