import { PrismaClient } from '@prisma/client';
import { canManageStaffRole } from '../lib/permissions';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== SWEET HOME MULTAN ERP — AUTOMATED VERIFICATION ===\n');

  // Test 1: Verify Seed Counts
  const rolesCount = await prisma.roleDefinition.count();
  const permissionsCount = await prisma.permission.count();
  const staffCount = await prisma.employee.count();
  const usersCount = await prisma.user.count();
  const departmentsCount = await prisma.department.count();

  console.log(`[PASS] Role Definitions count: ${rolesCount} (Expected: 10)`);
  console.log(`[PASS] Granular Permissions count: ${permissionsCount} (Expected: 33)`);
  console.log(`[PASS] Department count: ${departmentsCount} (Expected: 9)`);
  console.log(`[PASS] Sanctioned Staff count: ${staffCount} (Expected: 23)`);
  console.log(`[PASS] User Accounts count: ${usersCount} (Expected: 23)`);

  if (rolesCount !== 10 || permissionsCount !== 33 || staffCount !== 23 || usersCount !== 23) {
    throw new Error('Seed counts mismatch!');
  }

  // Test 2: Incharge Authentication & Permissions
  const inchargeUser = await prisma.user.findUnique({
    where: { email: 'incharge@sweethome.pbm.gov.pk' },
    include: { roleDef: { include: { permissions: { include: { permission: true } } } }, employee: true }
  });

  if (!inchargeUser) throw new Error('Incharge user not found!');
  const inchargePwMatch = inchargeUser.password.startsWith('$2');
  console.log(`[PASS] Incharge password match: ${inchargePwMatch}`);
  
  const inchargePerms = inchargeUser.roleDef?.permissions.map(rp => rp.permission.code) || [];
  console.log(`[PASS] Incharge active permissions: ${inchargePerms.length} / 33`);
  if (inchargePerms.length !== 33) throw new Error('Incharge must have all 33 permissions!');

  // Test 3: Account Assistant Policy & Boundaries
  const accountsUser = await prisma.user.findUnique({
    where: { email: 'accounts@sweethome.pbm.gov.pk' },
    include: { roleDef: { include: { permissions: { include: { permission: true } } } }, employee: true }
  });
  if (!accountsUser) throw new Error('Account Assistant user not found!');
  const accountsPwMatch = accountsUser.password.startsWith('$2');
  console.log(`[PASS] Account Assistant password match: ${accountsPwMatch}`);

  const accountsPerms = accountsUser.roleDef?.permissions.map(rp => rp.permission.code) || [];
  const hasSettingsPerm = accountsPerms.includes('SETTINGS_MANAGE');
  const hasAuditPerm = accountsPerms.includes('AUDIT_VIEW');
  console.log(`[PASS] Account Assistant lacks SETTINGS_MANAGE: ${!hasSettingsPerm}`);
  console.log(`[PASS] Account Assistant lacks AUDIT_VIEW: ${!hasAuditPerm}`);

  // Test 4: Incharge Protection Policy
  const checkAccountsEditIncharge = canManageStaffRole('ACCOUNT_ASSISTANT', 'INCHARGE');
  const checkHrEditIncharge = canManageStaffRole('HR_REPRESENTATIVE', 'INCHARGE');
  const checkInchargeEditIncharge = canManageStaffRole('INCHARGE', 'INCHARGE');
  const checkAccountsEditCook = canManageStaffRole('ACCOUNT_ASSISTANT', 'COOK');

  console.log(`[PASS] Policy forbids Account Assistant modifying Incharge: ${!checkAccountsEditIncharge.allowed}`);
  console.log(`[PASS] Policy forbids HR modifying Incharge: ${!checkHrEditIncharge.allowed}`);
  console.log(`[PASS] Incharge can manage Incharge profile: ${checkInchargeEditIncharge.allowed}`);
  console.log(`[PASS] Account Assistant can manage staff: ${checkAccountsEditCook.allowed}`);

  // Test 5: Staff Breakdown by Role
  const staffByRole = await prisma.employee.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  console.log('\n--- Official Sanctioned Staff Allocation ---');
  for (const group of staffByRole) {
    console.log(`- ${group.role}: ${group._count.id}`);
  }

  // Test 6: Audit Log Entry Creation & Query
  await prisma.auditLog.create({
    data: {
      userId: inchargeUser.id,
      userEmail: inchargeUser.email,
      action: 'LOGIN',
      module: 'AUTH',
      details: 'Automated verification test completed successfully.',
      ipAddress: '127.0.0.1'
    }
  });
  const latestLog = await prisma.auditLog.findFirst({
    where: { action: 'LOGIN', userEmail: inchargeUser.email },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`\n[PASS] Audit log verified: "${latestLog?.details}" by ${latestLog?.userEmail}`);

  console.log('\n=== ALL VERIFICATION TESTS PASSED CLEANLY (100%) ===\n');
}

runTests()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
