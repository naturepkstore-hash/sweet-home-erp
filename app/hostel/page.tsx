import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { HostelManagement } from '@/components/hostel/HostelManagement';

export default async function HostelPage() {
  await requireAuth();

  return (
    <AppLayout>
      <HostelManagement />
    </AppLayout>
  );
}
