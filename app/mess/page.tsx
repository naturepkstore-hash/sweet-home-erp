import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { MessManagement } from '@/components/mess/MessManagement';

export default async function MessPage() {
  await requireAuth();

  return (
    <AppLayout>
      <MessManagement />
    </AppLayout>
  );
}
