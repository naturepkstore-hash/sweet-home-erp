import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { StaffManagement } from '@/components/staff/StaffManagement';

export default async function StaffPage() {
  await requireAuth();

  return (
    <AppLayout>
      <StaffManagement />
    </AppLayout>
  );
}
