import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { FinanceManagement } from '@/components/finance/FinanceManagement';

export default async function FinancePage() {
  await requireAuth();

  return (
    <AppLayout>
      <FinanceManagement />
    </AppLayout>
  );
}
