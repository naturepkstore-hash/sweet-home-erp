import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { HostelManagement } from '@/components/hostel/HostelManagement';

export default async function HostelPage() {
  await requireModuleAccess('hostel');

  return (
    <AppLayout>
      <HostelManagement />
    </AppLayout>
  );
}

