import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExpensesManagement } from '@/components/expenses/ExpensesManagement';

export default async function ExpensesPage() {
  await requireModuleAccess('expenses');

  return (
    <AppLayout>
      <ExpensesManagement />
    </AppLayout>
  );
}

