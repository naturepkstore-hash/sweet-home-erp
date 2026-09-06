import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChildrenManagement } from '@/components/children/ChildrenManagement';

export default async function ChildrenPage() {
  await requireAuth();

  return (
    <AppLayout>
      <ChildrenManagement />
    </AppLayout>
  );
}
