import { requireAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PayrollManagement } from '@/components/payroll/PayrollManagement';

export default async function PayrollPage() {
  const user = await requireAuth();
  return <AppLayout><PayrollManagement canManage={user.role === 'INCHARGE' || user.role === 'ACCOUNT_ASSISTANT'} /></AppLayout>;
}
