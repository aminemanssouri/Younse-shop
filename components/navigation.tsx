'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Package, ShoppingCart, Users, DollarSign, Globe, Menu, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import { Language } from '@/lib/translations';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Navigation() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentTheme = (resolvedTheme || theme) as 'light' | 'dark' | undefined;
  const isDark = currentTheme === 'dark';

  const navItems = [
    {
      href: '/',
      label: t('dashboard'),
      icon: BarChart3,
    },
    {
      href: '/products',
      label: t('products'),
      icon: Package,
    },
    {
      href: '/sales',
      label: t('sales'),
      icon: ShoppingCart,
    },
    {
      href: '/customer-debts',
      label: t('customerDebts'),
      icon: Users,
    },
    {
      href: '/supplier-debts',
      label: t('supplierDebts'),
      icon: DollarSign,
    },
  ];

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
              <BarChart3 className="h-6 w-6" />
              <span>Younes Shop</span>
            </Link>
            
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('menu')}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SheetHeader className="border-b border-border p-4">
                  <SheetTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Younes Shop</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="p-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="mt-2 border-t border-border pt-3 px-2">
                    <div className="text-xs text-muted-foreground mb-2">{t('theme')}</div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span>{isDark ? t('lightMode') : t('darkMode')}</span>
                    </Button>
                  </div>

                  <div className="mt-2 border-t border-border pt-3 px-2">
                    <div className="text-xs text-muted-foreground mb-2">{t('language')}</div>
                    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? t('lightMode') : t('darkMode')}
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="w-10 h-9 border-0 px-0">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </nav>
  );
}
