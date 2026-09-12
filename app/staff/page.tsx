import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { StaffManagement } from '@/components/staff/StaffManagement';

export default async function StaffPage() {
  await requireModuleAccess('staff');

  return (
    <AppLayout>
      <StaffManagement />
    </AppLayout>
  );
}

