import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PurchasesManagement } from '@/components/purchases/PurchasesManagement';

export default async function PurchasesPage() {
  await requireAuth();

  return (
    <AppLayout>
      <PurchasesManagement />
    </AppLayout>
  );
}
