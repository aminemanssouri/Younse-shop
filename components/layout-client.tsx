'use client';

import { LanguageProvider } from '@/contexts/language-context';
import { FloatingNotesButton } from '@/components/floating-notes-button';
import { FloatingCalculatorButton } from '@/components/floating-calculator-button';
import { ThemeProvider } from '@/components/theme-provider';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        {children}
        <FloatingNotesButton />
        <FloatingCalculatorButton />
      </LanguageProvider>
    </ThemeProvider>
  );
}
