import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuditManagement } from '@/components/audit/AuditManagement';

export default async function AuditPage() {
  await requireModuleAccess('audit');

  return (
    <AppLayout>
      <AuditManagement />
    </AppLayout>
  );
}

