import React from 'react';
import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { AttendanceManagement } from '@/components/attendance/AttendanceManagement';

export default async function AttendancePage() {
  await requireAuth();

  return (
    <AppLayout>
      <AttendanceManagement />
    </AppLayout>
  );
}
