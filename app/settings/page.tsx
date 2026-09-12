import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsManagement } from '@/components/settings/SettingsManagement';

export default async function SettingsPage() {
  await requireModuleAccess('settings');

  return (
    <AppLayout>
      <SettingsManagement />
    </AppLayout>
  );
}

