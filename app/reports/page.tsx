import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportsManagement } from '@/components/reports/ReportsManagement';

export default async function ReportsPage() {
  await requireAuth();

  return (
    <AppLayout>
      <ReportsManagement />
    </AppLayout>
  );
}
