'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';

interface SimpleCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleCalculator({ isOpen, onClose }: SimpleCalculatorProps) {
  const { t } = useLanguage();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return prev / current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{t('calculator')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            value={display}
            readOnly
            className="text-right text-2xl font-bold"
          />
          
          <div className="grid grid-cols-4 gap-2">
            {/* First Row */}
            <Button
              variant="outline"
              onClick={handleClear}
              className="col-span-2"
            >
              AC
            </Button>
            <Button
              variant="outline"
              onClick={handleBackspace}
            >
              ⌫
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOperation('÷')}
            >
              ÷
            </Button>

            {/* Number Rows */}
            {[7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => handleNumber(String(num))}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handleOperation('×')}
            >
              ×
            </Button>

            {[4, 5, 6].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => handleNumber(String(num))}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handleOperation('-')}
            >
              -
            </Button>

            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => handleNumber(String(num))}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handleOperation('+')}
            >
              +
            </Button>

            {/* Last Row */}
            <Button
              variant="outline"
              onClick={() => handleNumber('0')}
              className="col-span-2"
            >
              0
            </Button>
            <Button
              variant="outline"
              onClick={handleDecimal}
            >
              .
            </Button>
            <Button
              onClick={handleEquals}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              =
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
