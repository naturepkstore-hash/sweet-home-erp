import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { EducationManagement } from '@/components/education/EducationManagement';

export default async function EducationPage() {
  await requireModuleAccess('education');

  return (
    <AppLayout>
      <EducationManagement />
    </AppLayout>
  );
}

