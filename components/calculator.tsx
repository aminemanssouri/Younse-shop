'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Calculator({ isOpen, onClose }: CalculatorProps) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'area' | 'basic'>('area');

  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [result, setResult] = useState<{ area: number; cost: number } | null>(null);

  const [basicDisplay, setBasicDisplay] = useState('0');
  const [basicPreviousValue, setBasicPreviousValue] = useState<number | null>(null);
  const [basicOperation, setBasicOperation] = useState<string | null>(null);
  const [basicNewNumber, setBasicNewNumber] = useState(true);

  const handleCalculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const price = parseFloat(pricePerUnit);

    if (isNaN(l) || isNaN(w) || isNaN(price)) {
      alert(t('error'));
      return;
    }

    const area = l * w;
    const cost = area * price;

    setResult({ area, cost });
  };

  const handleReset = () => {
    setLength('');
    setWidth('');
    setPricePerUnit('');
    setResult(null);
  };

  const basicHandleNumber = (num: string) => {
    if (basicNewNumber) {
      setBasicDisplay(num);
      setBasicNewNumber(false);
    } else {
      setBasicDisplay(basicDisplay === '0' ? num : basicDisplay + num);
    }
  };

  const basicHandleDecimal = () => {
    if (basicNewNumber) {
      setBasicDisplay('0.');
      setBasicNewNumber(false);
    } else if (!basicDisplay.includes('.')) {
      setBasicDisplay(basicDisplay + '.');
    }
  };

  const basicCalculate = (prev: number, current: number, op: string): number => {
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

  const basicHandleOperation = (op: string) => {
    const currentValue = parseFloat(basicDisplay);

    if (basicPreviousValue === null) {
      setBasicPreviousValue(currentValue);
    } else if (basicOperation) {
      const r = basicCalculate(basicPreviousValue, currentValue, basicOperation);
      setBasicDisplay(String(r));
      setBasicPreviousValue(r);
    }

    setBasicOperation(op);
    setBasicNewNumber(true);
  };

  const basicHandleEquals = () => {
    if (basicOperation && basicPreviousValue !== null) {
      const currentValue = parseFloat(basicDisplay);
      const r = basicCalculate(basicPreviousValue, currentValue, basicOperation);
      setBasicDisplay(String(r));
      setBasicPreviousValue(null);
      setBasicOperation(null);
      setBasicNewNumber(true);
    }
  };

  const basicHandleClear = () => {
    setBasicDisplay('0');
    setBasicPreviousValue(null);
    setBasicOperation(null);
    setBasicNewNumber(true);
  };

  const basicHandleBackspace = () => {
    if (basicDisplay.length > 1) {
      setBasicDisplay(basicDisplay.slice(0, -1));
    } else {
      setBasicDisplay('0');
      setBasicNewNumber(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('calculator')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === 'area' ? 'default' : 'outline'}
              onClick={() => setMode('area')}
            >
              {t('areaCalculator')}
            </Button>
            <Button
              type="button"
              variant={mode === 'basic' ? 'default' : 'outline'}
              onClick={() => setMode('basic')}
            >
              {t('basicCalculator')}
            </Button>
          </div>

          {mode === 'area' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">{t('length')}</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('width')}</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('pricePerUnit')}</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  step="0.01"
                />
              </div>

              {result && (
                <Card className="bg-accent/10 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('totalArea')}:</span>
                      <span className="font-semibold">{result.area.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('totalCost')}:</span>
                      <span className="font-semibold">{displayPrice(result.cost, language)}</span>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleCalculate} className="flex-1" variant="default">
                  {t('calculate')}
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  {t('reset')}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                value={basicDisplay}
                readOnly
                className="text-right text-2xl font-bold"
              />

              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={basicHandleClear} className="col-span-2">
                  AC
                </Button>
                <Button variant="outline" onClick={basicHandleBackspace}>
                  ⌫
                </Button>
                <Button variant="outline" onClick={() => basicHandleOperation('÷')}>
                  ÷
                </Button>

                {[7, 8, 9].map((num) => (
                  <Button key={num} variant="outline" onClick={() => basicHandleNumber(String(num))}>
                    {num}
                  </Button>
                ))}
                <Button variant="outline" onClick={() => basicHandleOperation('×')}>
                  ×
                </Button>

                {[4, 5, 6].map((num) => (
                  <Button key={num} variant="outline" onClick={() => basicHandleNumber(String(num))}>
                    {num}
                  </Button>
                ))}
                <Button variant="outline" onClick={() => basicHandleOperation('-')}>
                  -
                </Button>

                {[1, 2, 3].map((num) => (
                  <Button key={num} variant="outline" onClick={() => basicHandleNumber(String(num))}>
                    {num}
                  </Button>
                ))}
                <Button variant="outline" onClick={() => basicHandleOperation('+')}>
                  +
                </Button>

                <Button variant="outline" onClick={() => basicHandleNumber('0')} className="col-span-2">
                  0
                </Button>
                <Button variant="outline" onClick={basicHandleDecimal}>
                  .
                </Button>
                <Button onClick={basicHandleEquals} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  =
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
