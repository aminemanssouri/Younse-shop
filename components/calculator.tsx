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
  const { t } = useLanguage();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [result, setResult] = useState<{ area: number; cost: number } | null>(null);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('calculator')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
                  <span className="font-semibold">{displayPrice(result.cost)}</span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCalculate}
              className="flex-1"
              variant="default"
            >
              {t('calculate')}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
