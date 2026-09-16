import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeaveManagement } from '@/components/leave/LeaveManagement';

export default async function LeavePage() {
  const user = await requireAuth();
  return <AppLayout><LeaveManagement canReview={['INCHARGE', 'ACCOUNT_ASSISTANT', 'HR_REPRESENTATIVE'].includes(user.role)} /></AppLayout>;
}
