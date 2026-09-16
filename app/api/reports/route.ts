import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

function effectiveDutyStatus(status: string, dutyDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if ((status === 'ASSIGNED' || status === 'PENDING') && dutyDate < today) return 'OVERDUE';
  return status;
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'CHILDREN';

    let data: any[] = [];
    let title = '';

    switch (reportType) {
      case 'CHILDREN':
        title = 'Resident Children Official Roster & Dossier';
        const children = await prisma.child.findMany({
          include: {
            class: true,
            bed: { include: { room: true } },
            motherMaid: true,
            medicalRecord: true,
          },
          orderBy: { childId: 'asc' },
        });
        data = children.map((c, i) => ({
          'Sr #': i + 1,
          'Child ID': c.childId,
          'Full Name': c.fullName,
          'Father / Guardian': c.fatherGuardianName,
          'B-Form / CNIC': c.bFormNo || '-',
          'Date of Birth': c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString() : '-',
          'Academic Class': c.class?.name || '-',
          'Hostel Room & Bed': `${c.bed?.room.roomNumber || ''} - ${c.bed?.bedNumber || 'Assigned'}`,
          'Mother Maid': c.motherMaid?.fullName || 'Care Staff',
          'Blood Group': c.medicalRecord?.bloodGroup || 'B+',
          'Status': c.status,
        }));
        break;

      case 'STAFF':
        title = 'Official Institutional Staff Force Directory';
        const staff = await prisma.employee.findMany({
          include: { user: true },
          orderBy: { fullName: 'asc' },
        });
        data = staff.map((s, i) => ({
          'Sr #': i + 1,
          'Staff Full Name': s.fullName,
          'Father / Husband': s.fatherHusbandName,
          'CNIC': s.cnic,
          'Phone': s.phoneNumber,
          'Designation': s.role,
          'Department': s.department,
          'Employment Status': s.employmentStatus,
          'Login Account': s.user?.email || 'N/A',
          'Emergency Contact': s.emergencyContact,
        }));
        break;

      case 'ATTENDANCE':
        const month = searchParams.get('month');
        const monthStart = month ? new Date(`${month}-01T00:00:00`) : undefined;
        const monthEnd = monthStart ? new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1) : undefined;
        title = month ? `Institutional Attendance Report - ${month}` : 'Daily Institutional Attendance Record';
        const attendances = await prisma.attendance.findMany({
          where: monthStart && monthEnd ? { date: { gte: monthStart, lt: monthEnd } } : undefined,
          include: {
            child: { select: { fullName: true, childId: true } },
            employee: { select: { fullName: true, role: true } },
          },
          orderBy: { date: 'desc' },
        });
        data = attendances.map((a, i) => ({
          'Sr #': i + 1,
          'Date': new Date(a.date).toLocaleDateString(),
          'Type': a.type,
          'Name': a.child?.fullName || a.employee?.fullName || '-',
          'ID / Role': a.child?.childId || a.employee?.role || '-',
          'Status': a.status,
          'Remarks': a.remarks || '-',
          'Marked By': a.markedBy || 'System',
        }));
        break;

      case 'DUTIES':
        if (!hasPermission(currentUser.role, 'duties.report', currentUser.permissions)) {
          return NextResponse.json({ error: 'You are not authorized to access duty reports' }, { status: 403 });
        }
        title = 'Staff Duty Assignment & Completion Report';
        const dutyAssignments = await prisma.dutyAssignment.findMany({
          include: {
            employee: { select: { fullName: true, role: true } },
            duty: { select: { nameEnglish: true, nameUrdu: true } },
            assignedBy: { select: { email: true, employee: { select: { fullName: true } } } },
          },
          orderBy: [{ dutyDate: 'desc' }, { employee: { fullName: 'asc' } }],
        });
        data = dutyAssignments.map((assignment, i) => ({
          'Sr #': i + 1,
          'Employee': assignment.employee.fullName,
          'Role': assignment.employee.role,
          'Duty': assignment.duty.nameEnglish,
          'Urdu Duty': assignment.duty.nameUrdu,
          'Date': new Date(assignment.dutyDate).toLocaleDateString(),
          'Shift': assignment.shift,
          'Status': effectiveDutyStatus(assignment.status, assignment.dutyDate),
          'Assigned By': assignment.assignedBy.employee?.fullName || assignment.assignedBy.email,
          'Completed At': assignment.completedAt ? new Date(assignment.completedAt).toLocaleString() : '-',
        }));
        break;

      case 'HOSTEL':
        title = 'Hostel Bed Occupancy & Room Allocation Audit';
        const beds = await prisma.bed.findMany({
          include: {
            room: { include: { building: true } },
            child: true,
          },
          orderBy: { bedNumber: 'asc' },
        });
        data = beds.map((b, i) => ({
          'Sr #': i + 1,
          'Building': b.room.building.name,
          'Room Number': b.room.roomNumber,
          'Floor': b.room.floor,
          'Bed Number': b.bedNumber,
          'Bed Status': b.status,
          'Occupant Child Name': b.child?.fullName || 'Vacant',
          'Occupant Child ID': b.child?.childId || '-',
        }));
        break;

      case 'EDUCATION':
        title = 'Student Academic Progress & Examination Results';
        const edu = await prisma.educationRecord.findMany({
          include: {
            child: true,
            class: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        data = edu.map((e, i) => ({
          'Sr #': i + 1,
          'Student Name': e.child.fullName,
          'Child ID': e.child.childId,
          'Class': e.class?.name || 'Class 4',
          'Academic Term': e.examTerm,
          'Total Marks': e.totalMarks,
          'Obtained Marks': e.obtainedMarks,
          'Percentage': `${Math.round((e.obtainedMarks / e.totalMarks) * 100)}%`,
          'Grade': e.grade,
          'Remarks': e.remarks || '-',
        }));
        break;

      case 'INVENTORY':
      case 'RATION':
        title = 'Inventory & Ration Stock Ledger Balance';
        const items = await prisma.inventoryItem.findMany({
          include: { category: true },
          orderBy: { name: 'asc' },
        });
        data = items.map((it, i) => ({
          'Sr #': i + 1,
          'Item Name': it.name,
          'Category': it.category.name,
          'Current Stock': `${it.currentStock} ${it.unit}`,
          'Min Reorder Level': `${it.minStock} ${it.unit}`,
          'Stock Status': it.status,
          'Approved Supplier': it.supplier || '-',
        }));
        break;

      case 'LOW_STOCK':
        title = 'Low Stock & Reorder Requisition Alert Report';
        const allItems = await prisma.inventoryItem.findMany({
          include: { category: true },
        });
        const lowItems = allItems.filter((it) => it.currentStock <= it.minStock);
        data = lowItems.map((it, i) => ({
          'Sr #': i + 1,
          'Item Name': it.name,
          'Category': it.category.name,
          'Available Stock': `${it.currentStock} ${it.unit}`,
          'Minimum Required': `${it.minStock} ${it.unit}`,
          'Deficit': `${it.minStock - it.currentStock} ${it.unit}`,
          'Status': it.status,
          'Supplier': it.supplier || '-',
        }));
        break;

      case 'PURCHASES':
        title = 'Procurement & Purchase Orders Summary';
        const purchases = await prisma.purchase.findMany({
          include: { supplier: true, items: true },
          orderBy: { purchaseDate: 'desc' },
        });
        data = purchases.map((p, i) => ({
          'Sr #': i + 1,
          'PO Number': p.purchaseNumber,
          'Supplier': p.supplier.name,
          'Date': new Date(p.purchaseDate).toLocaleDateString(),
          'Bill Number': p.billNumber || '-',
          'Total Amount (PKR)': p.totalAmount,
          'Payment Status': p.paymentStatus,
          'Payment Method': p.paymentMethod,
          'Items Count': p.items.length,
        }));
        break;

      case 'EXPENSES':
        title = 'Institutional Expenditure & Expense Vouchers';
        const expenses = await prisma.financeTransaction.findMany({
          where: { type: 'EXPENSE' },
          include: { category: true, responsiblePerson: true },
          orderBy: { date: 'desc' },
        });
        data = expenses.map((e, i) => ({
          'Sr #': i + 1,
          'Date': new Date(e.date).toLocaleDateString(),
          'Expense Category': e.category?.name || 'General',
          'Description': e.description,
          'Amount (PKR)': e.amount,
          'Bill / Cheque #': e.referenceNumber || '-',
          'Payment Method': e.paymentMethod,
          'Responsible Officer': e.responsiblePerson?.fullName || '-',
        }));
        break;

      case 'KITCHEN':
        title = 'Kitchen Meal Preparation & Daily Head Count';
        const meals = await prisma.mealRecord.findMany({
          orderBy: { createdAt: 'desc' },
        });
        data = meals.map((m, i) => ({
          'Sr #': i + 1,
          'Date': new Date(m.date).toLocaleDateString(),
          'Meal Type': m.mealType,
          'Dish Prepared': m.menuItem,
          'Children Heads': m.childCount,
          'Staff Heads': m.staffCount,
          'Total Heads Served': m.totalHeads,
          'Head Cook': m.preparedBy,
        }));
        break;

      case 'MEDICAL':
        title = 'Child Medical History & Doctor Checkups';
        const visits = await prisma.medicalVisit.findMany({
          include: { child: true },
          orderBy: { visitDate: 'desc' },
        });
        data = visits.map((v, i) => ({
          'Sr #': i + 1,
          'Checkup Date': new Date(v.visitDate).toLocaleDateString(),
          'Child Name': v.child.fullName,
          'Child ID': v.child.childId,
          'Attending Doctor': v.doctorName,
          'Hospital / Clinic': v.clinicHospital,
          'Diagnosis': v.diagnosis,
          'Prescription': v.prescription || '-',
          'Vitals': v.vitals || '-',
        }));
        break;

      case 'COMPLAINTS':
        title = 'Child Complaints & Resolution Register';
        const complaints = await prisma.childComplaint.findMany({
          include: { child: { select: { fullName: true, childId: true } } },
          orderBy: { createdAt: 'desc' },
        });
        data = complaints.map((complaint, i) => ({
          'Sr #': i + 1,
          'Child Name': complaint.child.fullName,
          'Child ID': complaint.child.childId,
          'Category': complaint.category,
          'Complaint': complaint.description,
          'Status': complaint.status,
          'Reported By': complaint.reportedBy || '-',
          'Reported Date': new Date(complaint.createdAt).toLocaleDateString(),
          'Resolved Date': complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : '-',
        }));
        break;

      case 'MONTHLY':
      case 'YEARLY':
      default:
        title = 'Monthly Financial Ledger & Grant Balance Statement';
        const allTxns = await prisma.financeTransaction.findMany({
          include: { category: true },
          orderBy: { date: 'desc' },
        });
        data = allTxns.map((t, i) => ({
          'Sr #': i + 1,
          'Date': new Date(t.date).toLocaleDateString(),
          'Type': t.type,
          'Category': t.category?.name || 'General',
          'Description': t.description,
          'Amount (PKR)': t.amount,
          'Payment Method': t.paymentMethod,
          'Cheque #': t.referenceNumber || '-',
        }));
        break;
    }

    return NextResponse.json({ success: true, reportType, title, data });
  } catch (error) {
    console.error('Fetch report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
