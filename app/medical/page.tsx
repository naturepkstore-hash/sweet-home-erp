import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { MedicalManagement } from '@/components/medical/MedicalManagement';

export default async function MedicalPage() {
  await requireModuleAccess('medical');

  return (
    <AppLayout>
      <MedicalManagement />
    </AppLayout>
  );
}

