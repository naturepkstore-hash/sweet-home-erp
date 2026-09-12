import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChildrenManagement } from '@/components/children/ChildrenManagement';

export default async function ChildrenPage() {
  await requireModuleAccess('children');

  return (
    <AppLayout>
      <ChildrenManagement />
    </AppLayout>
  );
}

