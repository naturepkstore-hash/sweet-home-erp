import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PurchasesManagement } from '@/components/purchases/PurchasesManagement';

export default async function PurchasesPage() {
  await requireModuleAccess('purchases');

  return (
    <AppLayout>
      <PurchasesManagement />
    </AppLayout>
  );
}

