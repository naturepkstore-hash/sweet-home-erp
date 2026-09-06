import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { EducationManagement } from '@/components/education/EducationManagement';

export default async function EducationPage() {
  await requireAuth();

  return (
    <AppLayout>
      <EducationManagement />
    </AppLayout>
  );
}
