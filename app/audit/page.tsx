import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuditManagement } from '@/components/audit/AuditManagement';

export default async function AuditPage() {
  await requireAuth();

  return (
    <AppLayout>
      <AuditManagement />
    </AppLayout>
  );
}
