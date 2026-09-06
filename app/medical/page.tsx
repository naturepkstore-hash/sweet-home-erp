import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { MedicalManagement } from '@/components/medical/MedicalManagement';

export default async function MedicalPage() {
  await requireAuth();

  return (
    <AppLayout>
      <MedicalManagement />
    </AppLayout>
  );
}
