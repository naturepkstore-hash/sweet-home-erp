import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsManagement } from '@/components/settings/SettingsManagement';

export default async function SettingsPage() {
  await requireAuth();

  return (
    <AppLayout>
      <SettingsManagement />
    </AppLayout>
  );
}
