import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { MessManagement } from '@/components/mess/MessManagement';

export default async function MessPage() {
  await requireModuleAccess('mess');

  return (
    <AppLayout>
      <MessManagement />
    </AppLayout>
  );
}

