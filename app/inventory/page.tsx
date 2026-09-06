import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { InventoryManagement } from '@/components/inventory/InventoryManagement';

export default async function InventoryPage() {
  await requireAuth();

  return (
    <AppLayout>
      <InventoryManagement />
    </AppLayout>
  );
}
