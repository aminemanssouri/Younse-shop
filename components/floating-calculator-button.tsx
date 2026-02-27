'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator as CalculatorIcon } from 'lucide-react';
import { Calculator } from '@/components/calculator';
import { useLanguage } from '@/contexts/language-context';

export function FloatingCalculatorButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
        size="lg"
        variant="outline"
        title={t('calculator')}
      >
        <CalculatorIcon className="w-6 h-6" />
      </Button>

      <Calculator isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
