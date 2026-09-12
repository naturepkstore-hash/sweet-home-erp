import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportsManagement } from '@/components/reports/ReportsManagement';

export default async function ReportsPage() {
  await requireModuleAccess('reports');

  return (
    <AppLayout>
      <ReportsManagement />
    </AppLayout>
  );
}

