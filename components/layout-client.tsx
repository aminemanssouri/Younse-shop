'use client';

import { LanguageProvider } from '@/contexts/language-context';
import { FloatingNotesButton } from '@/components/floating-notes-button';
import { FloatingCalculatorButton } from '@/components/floating-calculator-button';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <FloatingNotesButton />
      <FloatingCalculatorButton />
    </LanguageProvider>
  );
}
