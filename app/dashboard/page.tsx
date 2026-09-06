import React from 'react';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { InchargeDashboard } from '@/components/dashboard/InchargeDashboard';
import { MotherMaidDashboard } from '@/components/dashboard/MotherMaidDashboard';
import { KitchenDashboard } from '@/components/dashboard/KitchenDashboard';
import { ServiceStaffDashboard } from '@/components/dashboard/ServiceStaffDashboard';
import { SecurityDashboard } from '@/components/dashboard/SecurityDashboard';
import { HRClerkDashboard } from '@/components/dashboard/HRClerkDashboard';

export default async function DashboardPage() {
  const user = await requireAuth();

  // Basic KPI stats
  const totalChildren = await prisma.child.count({ where: { status: 'ACTIVE' } });
  const totalStaff = await prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } });
  const totalBeds = await prisma.bed.count();
  const occupiedBeds = await prisma.bed.count({ where: { status: 'OCCUPIED' } });
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);

  // Inventory stats
  const totalInventoryItems = await prisma.inventoryItem.count();
  const allInventoryItems = await prisma.inventoryItem.findMany({
    include: { category: true },
  });

  const lowStockItems = allInventoryItems
    .filter((item) => item.currentStock <= item.minStock)
    .map((item) => ({
      id: item.id,
      name: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unit: item.unit,
      categoryName: item.category.name,
    }));

  // Today's Day of Week
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDay = days[new Date().getDay()];
  const todayMenuRecord = await prisma.dailyMenu.findUnique({
    where: { dayOfWeek: currentDay },
  });

  const todayMenu = todayMenuRecord
    ? {
        breakfast: todayMenuRecord.breakfastMenu,
        lunch: todayMenuRecord.lunchMenu,
        dinner: todayMenuRecord.dinnerMenu,
      }
    : null;

  // Monthly Expenses Sum
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyExpensesAgg = await prisma.financeTransaction.aggregate({
    where: {
      type: 'EXPENSE',
      date: { gte: startOfMonth },
    },
    _sum: { amount: true },
  });

  const monthlyExpenses = monthlyExpensesAgg._sum.amount || 0;

  // Recent Purchases
  const recentPurchasesRaw = await prisma.purchase.findMany({
    include: { supplier: true },
    orderBy: { purchaseDate: 'desc' },
    take: 5,
  });

  const recentPurchases = recentPurchasesRaw.map((p) => ({
    id: p.id,
    purchaseNumber: p.purchaseNumber,
    supplierName: p.supplier.name,
    totalAmount: p.totalAmount,
    purchaseDate: p.purchaseDate,
    paymentStatus: p.paymentStatus,
  }));

  // Recent Audit Logs
  const recentAudits = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Render role-tailored dashboard view
  return (
    <AppLayout>
      {/* 1. INCHARGE & ACCOUNT ASSISTANT */}
      {(user.role === Role.INCHARGE || user.role === Role.ACCOUNT_ASSISTANT) && (
        <InchargeDashboard
          stats={{
            totalChildren,
            totalStaff,
            presentChildrenToday: totalChildren,
            presentStaffToday: totalStaff,
            totalBeds,
            occupiedBeds,
            vacantBeds,
            lowStockCount: lowStockItems.length,
            totalInventoryItems,
            monthlyExpenses,
            todayMenu,
          }}
          recentPurchases={recentPurchases}
          recentAudits={recentAudits}
          lowStockItems={lowStockItems}
        />
      )}

      {/* 2. MOTHER MAID */}
      {user.role === Role.MOTHER_MAID && (
        (() => {
          // Fetch children assigned to this mother maid (or fallback to all resident children for general duty)
          return (
            <MotherMaidView
              user={user}
              employeeId={user.employeeId}
            />
          );
        })()
      )}

      {/* 3. COOK & COOK HELPER */}
      {(user.role === Role.COOK || user.role === Role.COOK_HELPER) && (
        <KitchenDashboard
          user={user}
          todayMenu={todayMenu}
          rationItems={allInventoryItems.map((i) => ({
            id: i.id,
            name: i.name,
            currentStock: i.currentStock,
            unit: i.unit,
          }))}
        />
      )}

      {/* 4. WAITER & SWEEPER */}
      {(user.role === Role.WAITER || user.role === Role.SWEEPER) && (
        <ServiceStaffDashboard user={user} />
      )}

      {/* 5. SECURITY GUARD */}
      {user.role === Role.SECURITY_GUARD && (
        <SecurityDashboard user={user} />
      )}

      {/* 6. HR & CLERK */}
      {(user.role === Role.HR_REPRESENTATIVE || user.role === Role.CLERK) && (
        <HRClerkDashboard
          user={user}
          totalStaff={totalStaff}
          totalChildren={totalChildren}
          recentRecords={[]}
        />
      )}
    </AppLayout>
  );
}

// Server helper component for Mother Maid assigned children
async function MotherMaidView({ user, employeeId }: { user: { id: string; fullName: string }; employeeId?: string }) {
  let assignedChildren = [];
  if (employeeId) {
    assignedChildren = await prisma.child.findMany({
      where: {
        OR: [
          { motherMaidId: employeeId },
          { motherMaidId: null }, // display unassigned children as available for care
        ],
      },
      include: {
        room: true,
        bed: true,
        class: true,
        medicalRecord: true,
      },
    });
  } else {
    assignedChildren = await prisma.child.findMany({
      include: {
        room: true,
        bed: true,
        class: true,
        medicalRecord: true,
      },
    });
  }

  const mappedChildren = assignedChildren.map((c) => ({
    id: c.id,
    childId: c.childId,
    fullName: c.fullName,
    fatherGuardianName: c.fatherGuardianName,
    dateOfBirth: c.dateOfBirth,
    bFormNo: c.bFormNo,
    status: c.status,
    roomNumber: c.room?.roomNumber || null,
    bedNumber: c.bed?.bedNumber || null,
    className: c.class?.name || null,
    bloodGroup: c.medicalRecord?.bloodGroup || null,
    allergies: c.medicalRecord?.allergies || null,
  }));

  return <MotherMaidDashboard user={user} assignedChildren={mappedChildren} />;
}
