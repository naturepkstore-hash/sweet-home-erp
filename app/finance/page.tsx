import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { FinanceManagement } from '@/components/finance/FinanceManagement';

export default async function FinancePage() {
  await requireModuleAccess('finance');

  return (
    <AppLayout>
      <FinanceManagement />
    </AppLayout>
  );
}

