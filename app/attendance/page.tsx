import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { AttendanceManagement } from '@/components/attendance/AttendanceManagement';

export default async function AttendancePage() {
  await requireModuleAccess('attendance');

  return (
    <AppLayout>
      <AttendanceManagement />
    </AppLayout>
  );
}

