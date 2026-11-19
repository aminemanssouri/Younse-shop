'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Download } from 'lucide-react';
import { CheckStatus, ClientCheck } from '@/lib/types';
import * as actions from '@/app/actions';
import { useChecks } from '@/hooks/use-checks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Navigation from '@/components/navigation';
import CheckModal from '@/components/check-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { formatCurrency } from '@/lib/currency';
import { buildAllChecksPdfHtml, buildSingleCheckPdfHtml, printHtmlDocument, CheckPdfLabels, CheckPdfRow } from '@/lib/check-pdf';

const STATUS_STYLES: Record<CheckStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const STATUS_LABEL_KEYS: Record<CheckStatus, string> = {
  pending: 'checkPending',
  paid: 'checkPaid',
  unpaid: 'checkUnpaid',
};

function formatCheckDate(value: string, locale: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale);
}

export default function ChecksPage() {
  const { t, language } = useLanguage();
  const { checks, loading, error, refetch } = useChecks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<ClientCheck | null>(null);
  const [viewingCheck, setViewingCheck] = useState<ClientCheck | null>(null);
  const [nameQuery, setNameQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-GB';

  const renderStatus = (status: CheckStatus | undefined) => {
    const value = status || 'pending';
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[value]}`}>
        {t(STATUS_LABEL_KEYS[value])}
      </span>
    );
  };

  const filteredChecks = checks.filter((check) => {
    const name = nameQuery.trim().toLowerCase();
    const matchesName = !name || (check.client_name || '').toLowerCase().includes(name);
    const day = check.check_date.slice(0, 10);
    const matchesFrom = !fromDate || day >= fromDate;
    const matchesTo = !toDate || day <= toDate;
    return matchesName && matchesFrom && matchesTo;
  });

  const total = filteredChecks.reduce((sum, check) => sum + (Number(check.amount) || 0), 0);

  const pdfLabels: CheckPdfLabels = {
    shop: 'Younes Shop',
    title: t('checksReport'),
    name: t('checkName'),
    date: t('checkDate'),
    amount: t('checkAmount'),
    bank: t('checkBank'),
    number: t('checkNumber'),
    notes: t('checkNotes'),
    total: t('totalChecks'),
  };

  const toPdfRow = (check: ClientCheck): CheckPdfRow => ({
    name: check.client_name,
    date: formatCheckDate(check.check_date, locale),
    amount: formatCurrency(Number(check.amount) || 0, language),
    bank: check.bank || '-',
    number: check.check_number || '-',
    notes: check.notes || '-',
  });

  const openPdf = (html: string) => {
    const opened = printHtmlDocument(html);
    if (!opened) {
      alert(t('downloadFailed') + ': Popup blocked. Please allow popups for this site.');
    }
  };

  const downloadOne = (check: ClientCheck) => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    openPdf(buildSingleCheckPdfHtml(toPdfRow(check), { ...pdfLabels, title: t('checkDetails') }, dir));
  };

  const downloadAll = () => {
    if (checks.length === 0) return;
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const rows = checks.map(toPdfRow);
    const allTotal = formatCurrency(
      checks.reduce((sum, check) => sum + (Number(check.amount) || 0), 0),
      language
    );
    openPdf(buildAllChecksPdfHtml(rows, allTotal, pdfLabels, dir));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('checks')}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t('checksSubtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={downloadAll}
              disabled={loading || checks.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {t('downloadAllChecks')}
            </Button>
            <Button
              onClick={() => {
                setEditingCheck(null);
                setIsModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('addCheck')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('checksRecords')}</CardTitle>
            <CardDescription>
              {t('checksRecordsDescription')}
              {' · '}
              {t('totalChecks')}: {formatCurrency(total, language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-4">
              <Input
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder={t('checkName')}
              />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label={t('fromDate')}
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label={t('toDate')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNameQuery('');
                  setFromDate('');
                  setToDate('');
                }}
              >
                {t('reset')}
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : error ? (
              <p className="text-destructive text-center py-4">{error}</p>
            ) : filteredChecks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t('noChecks')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">{t('checkDate')}</th>
                      <th className="text-left py-3 px-2">{t('checkName')}</th>
                      <th className="text-left py-3 px-2">{t('checkAmount')}</th>
                      <th className="text-left py-3 px-2">{t('checkBank')}</th>
                      <th className="text-left py-3 px-2">{t('checkNumber')}</th>
                      <th className="text-left py-3 px-2">{t('checkNotes')}</th>
                      <th className="text-left py-3 px-2">{t('checkStatus')}</th>
                      <th className="text-left py-3 px-2">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChecks.map((check) => (
                      <tr key={check.id} className="border-b">
                        <td className="py-3 px-2">{formatCheckDate(check.check_date, locale)}</td>
                        <td className="py-3 px-2 font-medium">{check.client_name}</td>
                        <td className="py-3 px-2">{formatCurrency(Number(check.amount) || 0, language)}</td>
                        <td className="py-3 px-2 text-muted-foreground">{check.bank || '-'}</td>
                        <td className="py-3 px-2 text-muted-foreground">{check.check_number || '-'}</td>
                        <td className="py-3 px-2 text-muted-foreground">{check.notes || '-'}</td>
                        <td className="py-3 px-2">{renderStatus(check.status)}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingCheck(check)}
                              aria-label={t('viewCheck')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadOne(check)}
                              aria-label={t('downloadCheck')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCheck(check);
                                setIsModalOpen(true);
                              }}
                              aria-label={t('editCheck')}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                if (!confirm(t('confirmDeleteCheck'))) return;
                                try {
                                  await actions.deleteClientCheck(check.id);
                                  refetch();
                                } catch (deleteError) {
                                  alert(deleteError instanceof Error ? deleteError.message : t('error'));
                                }
                              }}
                              aria-label={t('delete')}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!viewingCheck} onOpenChange={(open) => { if (!open) setViewingCheck(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('checkDetails')}</DialogTitle>
          </DialogHeader>
          {viewingCheck && (
            <div className="space-y-3 text-sm">
              <div className="text-2xl font-semibold">{formatCurrency(Number(viewingCheck.amount) || 0, language)}</div>
              <div className="flex justify-between gap-4 border-b py-2">
                <span className="text-muted-foreground">{t('checkName')}</span>
                <span className="font-medium text-end">{viewingCheck.client_name}</span>
              </div>
              <div className="flex justify-between gap-4 border-b py-2">
                <span className="text-muted-foreground">{t('checkDate')}</span>
                <span>{formatCheckDate(viewingCheck.check_date, locale)}</span>
              </div>
              <div className="flex justify-between gap-4 border-b py-2">
                <span className="text-muted-foreground">{t('checkBank')}</span>
                <span>{viewingCheck.bank || '-'}</span>
              </div>
              <div className="flex justify-between gap-4 border-b py-2">
                <span className="text-muted-foreground">{t('checkNumber')}</span>
                <span>{viewingCheck.check_number || '-'}</span>
              </div>
              <div className="flex justify-between gap-4 border-b py-2">
                <span className="text-muted-foreground">{t('checkStatus')}</span>
                {renderStatus(viewingCheck.status)}
              </div>
              <div className="py-2">
                <div className="text-muted-foreground">{t('checkNotes')}</div>
                <p className="mt-1 whitespace-pre-wrap">{viewingCheck.notes || '-'}</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" className="gap-2" onClick={() => downloadOne(viewingCheck)}>
                  <Download className="h-4 w-4" />
                  {t('downloadCheck')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CheckModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCheck(null);
        }}
        onSuccess={() => {
          refetch();
          setEditingCheck(null);
        }}
        check={editingCheck}
      />
    </div>
  );
}
