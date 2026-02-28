'use client';

import { LucideIcon } from 'lucide-react';
import { displayPrice } from '@/lib/currency';
import { useLanguage } from '@/contexts/language-context';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  format?: 'currency' | 'number' | 'default';
  accent?: 'blue' | 'green' | 'purple' | 'amber';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, format = 'default', accent = 'blue', trend }: KPICardProps) {
  const { language } = useLanguage();
  const formattedValue = 
    format === 'currency'
      ? displayPrice(typeof value === 'number' ? value : parseFloat(value), language)
      : format === 'number' && typeof value === 'number'
      ? value.toLocaleString()
      : value;

  const accentClasses: Record<NonNullable<KPICardProps['accent']>, { ring: string; bg: string; fg: string }> = {
    blue: { ring: 'ring-blue-500/20', bg: 'bg-blue-500/10', fg: 'text-blue-600 dark:text-blue-400' },
    green: { ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/10', fg: 'text-emerald-600 dark:text-emerald-400' },
    purple: { ring: 'ring-violet-500/20', bg: 'bg-violet-500/10', fg: 'text-violet-600 dark:text-violet-400' },
    amber: { ring: 'ring-amber-500/20', bg: 'bg-amber-500/10', fg: 'text-amber-600 dark:text-amber-400' },
  };

  const a = accentClasses[accent];

  return (
    <div className={`rounded-lg border border-border bg-card p-6 shadow-sm ring-1 ${a.ring}`}>
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
        <div className={`rounded-lg p-3 ${a.bg}`}>
          <Icon className={`h-6 w-6 ${a.fg}`} />
        </div>
      </div>
    </div>
  );
}
