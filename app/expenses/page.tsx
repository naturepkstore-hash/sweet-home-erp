import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExpensesManagement } from '@/components/expenses/ExpensesManagement';

export default async function ExpensesPage() {
  await requireAuth();

  return (
    <AppLayout>
      <ExpensesManagement />
    </AppLayout>
  );
}
