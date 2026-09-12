import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { InventoryManagement } from '@/components/inventory/InventoryManagement';

export default async function InventoryPage() {
  await requireModuleAccess('inventory');

  return (
    <AppLayout>
      <InventoryManagement />
    </AppLayout>
  );
}

