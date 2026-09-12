import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { DutyManagement } from '@/components/duties/DutyManagement';

export default async function DutiesPage() {
  await requireModuleAccess('duties');

  return (
    <AppLayout>
      <DutyManagement />
    </AppLayout>
  );
}
