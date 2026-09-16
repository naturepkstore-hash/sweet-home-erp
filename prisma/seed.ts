import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sweet Home Multan ERP database seed...');

  // 1. Hash explicitly supplied seed passwords; never keep credentials in source.
  const adminPlainPassword = process.env.SEED_ADMIN_PASSWORD;
  const accountsPlainPassword = process.env.SEED_ACCOUNTS_PASSWORD;
  const staffPlainPassword = process.env.SEED_STAFF_PASSWORD;
  if (!adminPlainPassword || !accountsPlainPassword || !staffPlainPassword) {
    throw new Error('SEED_ADMIN_PASSWORD, SEED_ACCOUNTS_PASSWORD, and SEED_STAFF_PASSWORD are required');
  }
  const adminPassword = await bcrypt.hash(adminPlainPassword, 10);
  const accountsPassword = await bcrypt.hash(accountsPlainPassword, 10);
  const staffPassword = await bcrypt.hash(staffPlainPassword, 10);

  // 2. Seed All 10 Role Definitions
  const rolesData = [
    {
      name: 'INCHARGE',
      displayName: 'Incharge (Highest Authority)',
      description: 'Project Director / Head of Sweet Home Multan with complete institutional, administrative, and financial authority.',
    },
    {
      name: 'ACCOUNT_ASSISTANT',
      displayName: 'Account Assistant',
      description: 'Full operational ERP access over Accounts, Procurement, Inventory, Ration, Children, and Staff records.',
    },
    {
      name: 'HR_REPRESENTATIVE',
      displayName: 'HR Representative',
      description: 'Human Resources management, staff profiles, duty rosters, attendance tracking, and institutional correspondence.',
    },
    {
      name: 'CLERK',
      displayName: 'Records Clerk',
      description: 'Admissions, orphan child profiles, document verification, academic records, and hostel bed allocations.',
    },
    {
      name: 'MOTHER_MAID',
      displayName: 'Mother Maid',
      description: 'Dedicated maternal care, daily hygiene, meal supervision, and assigned room children monitoring.',
    },
    {
      name: 'WAITER',
      displayName: 'Waiter / Dining Staff',
      description: 'Dining hall food distribution, meal serving records, tableware sanitation, and mealtime discipline.',
    },
    {
      name: 'COOK',
      displayName: 'Head Cook',
      description: 'Kitchen management, meal preparation according to weekly approved menu, and ration consumption logging.',
    },
    {
      name: 'COOK_HELPER',
      displayName: 'Cook Helper',
      description: 'Kitchen assistant for vegetable preparation, dough kneading, dishwashing, and ration fetching.',
    },
    {
      name: 'SWEEPER',
      displayName: 'Sanitation Staff',
      description: 'Campus sanitation, hostel rooms cleanliness, hygiene maintenance, and waste management.',
    },
    {
      name: 'SECURITY_GUARD',
      displayName: 'Security Guard',
      description: 'Main gate access control, visitor registry, shift security surveillance, and child safety.',
    },
    {
      name: 'DRIVER',
      displayName: 'Driver',
      description: 'Approved institutional transport, school pick and drop, and official movement support.',
    },
    {
      name: 'QARI_QARIA',
      displayName: 'Qari / Qaria',
      description: 'Religious education, Quran instruction, and supervised learning activities.',
    },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of rolesData) {
    const roleRecord = await prisma.roleDefinition.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: r,
    });
    roleMap[r.name] = roleRecord.id;
  }
  console.log(`✅ Seeded ${rolesData.length} Role Definitions`);

  const dutiesData = [
    { nameEnglish: 'Room Cleaning', nameUrdu: 'کمرے کی صفائی', description: 'Clean and prepare assigned rooms and living areas.' },
    { nameEnglish: 'Children Supervision', nameUrdu: 'بچوں کی نگرانی', description: 'Supervise children during assigned care periods.' },
    { nameEnglish: 'Breakfast Duty', nameUrdu: 'ناشتے کی ڈیوٹی', description: 'Prepare, serve, and monitor breakfast service.' },
    { nameEnglish: 'Lunch Duty', nameUrdu: 'دوپہر کے کھانے کی ڈیوٹی', description: 'Prepare, serve, and monitor lunch service.' },
    { nameEnglish: 'Dinner Duty', nameUrdu: 'رات کے کھانے کی ڈیوٹی', description: 'Prepare, serve, and monitor dinner service.' },
    { nameEnglish: 'Kitchen Cleaning', nameUrdu: 'کچن کی صفائی', description: 'Clean kitchen surfaces, utensils, and service areas.' },
    { nameEnglish: 'Night Duty', nameUrdu: 'رات کی ڈیوٹی', description: 'Perform assigned overnight supervision and safety checks.' },
    { nameEnglish: 'Laundry Duty', nameUrdu: 'کپڑوں کی صفائی', description: 'Collect, wash, dry, and organize assigned laundry.' },
    { nameEnglish: 'Gate Security', nameUrdu: 'گیٹ سیکیورٹی', description: 'Monitor the gate, visitors, and campus access.' },
    { nameEnglish: 'School Pick & Drop', nameUrdu: 'اسکول پک اینڈ ڈراپ', description: 'Support approved school transport movements.' },
  ];

  for (const duty of dutiesData) {
    await prisma.duty.upsert({
      where: { nameEnglish: duty.nameEnglish },
      update: { nameUrdu: duty.nameUrdu, description: duty.description, isActive: true },
      create: duty,
    });
  }
  console.log(`✅ Seeded ${dutiesData.length} Duty Catalog records`);

  // 3. Seed Granular Permissions
  const permissionsData = [
    // Dashboard
    { code: 'dashboard.view', module: 'dashboard', description: 'View role-tailored institutional dashboard' },

    // Employees / Staff
    { code: 'employees.view', module: 'employees', description: 'View staff directory and basic profiles' },
    { code: 'employees.create', module: 'employees', description: 'Register new staff members' },
    { code: 'employees.update', module: 'employees', description: 'Update staff details and contact info' },
    { code: 'employees.delete', module: 'employees', description: 'Archive or terminate staff members' },
    { code: 'employees.manage_users', module: 'employees', description: 'Create and manage individual staff login accounts' },
    { code: 'employees.manage_roles', module: 'employees', description: 'Assign roles to staff members' },

    // Children
    { code: 'children.view', module: 'children', description: 'View enrolled children profiles' },
    { code: 'children.create', module: 'children', description: 'Enroll new children and upload documents' },
    { code: 'children.update', module: 'children', description: 'Update child information and hostel allocations' },
    { code: 'children.delete', module: 'children', description: 'Discharge or transfer child records' },

    // Attendance
    { code: 'attendance.view', module: 'attendance', description: 'View daily attendance records' },
    { code: 'attendance.create', module: 'attendance', description: 'Mark daily staff and children attendance' },
    { code: 'attendance.update', module: 'attendance', description: 'Modify and verify attendance records' },

    // Inventory & Ration
    { code: 'inventory.view', module: 'inventory', description: 'View inventory stocks and items' },
    { code: 'inventory.create', module: 'inventory', description: 'Add new inventory items and categories' },
    { code: 'inventory.update', module: 'inventory', description: 'Update inventory item thresholds' },
    { code: 'inventory.stock_in', module: 'inventory', description: 'Record incoming stock from purchases' },
    { code: 'inventory.stock_out', module: 'inventory', description: 'Issue stock for consumption' },

    // Ration
    { code: 'ration.view', module: 'ration', description: 'View ration balances and benchmarks' },
    { code: 'ration.create', module: 'ration', description: 'Record ration allocations' },
    { code: 'ration.update', module: 'ration', description: 'Adjust ration stock levels' },

    // Kitchen & Mess
    { code: 'kitchen.view', module: 'kitchen', description: 'View weekly menu and meal records' },
    { code: 'kitchen.create', module: 'kitchen', description: 'Log meal preparations and submit requests' },
    { code: 'kitchen.update', module: 'kitchen', description: 'Update menu and kitchen consumption' },

    // Finance & Purchases
    { code: 'finance.view', module: 'finance', description: 'View ledger, grants, and expense entries' },
    { code: 'finance.create', module: 'finance', description: 'Record vouchers, expenses, and payments' },
    { code: 'finance.update', module: 'finance', description: 'Approve and reconcile financial transactions' },

    // Reports
    { code: 'reports.view', module: 'reports', description: 'Access institutional reports center' },
    { code: 'reports.export', module: 'reports', description: 'Export institutional reports to Excel/PDF' },

    // Audit Logs
    { code: 'audit_logs.view', module: 'audit', description: 'Review system audit trail and user activities' },

    // Settings
    { code: 'settings.view', module: 'settings', description: 'View institutional parameters and settings' },
    { code: 'settings.manage', module: 'settings', description: 'Modify core system configuration' },
  ];

  const permMap: Record<string, string> = {};
  for (const p of permissionsData) {
    const permRecord = await prisma.permission.upsert({
      where: { code: p.code },
      update: { description: p.description, module: p.module },
      create: p,
    });
    permMap[p.code] = permRecord.id;
  }
  console.log(`✅ Seeded ${permissionsData.length} Granular Permissions`);

  // 4. Link Role Permissions (RolePermission)
  const rolePermissionsMatrix: Record<string, string[]> = {
    INCHARGE: Object.keys(permMap),
    ACCOUNT_ASSISTANT: [
      'dashboard.view',
      'employees.view',
      'employees.create',
      'employees.update',
      'employees.manage_users',
      'children.view',
      'children.create',
      'children.update',
      'attendance.view',
      'attendance.create',
      'attendance.update',
      'inventory.view',
      'inventory.create',
      'inventory.update',
      'inventory.stock_in',
      'inventory.stock_out',
      'ration.view',
      'ration.create',
      'ration.update',
      'kitchen.view',
      'kitchen.create',
      'kitchen.update',
      'finance.view',
      'finance.create',
      'finance.update',
      'reports.view',
      'reports.export',
    ],
    HR_REPRESENTATIVE: [
      'dashboard.view',
      'employees.view',
      'employees.create',
      'employees.update',
      'attendance.view',
      'attendance.create',
      'attendance.update',
      'reports.view',
    ],
    CLERK: [
      'dashboard.view',
      'children.view',
      'children.create',
      'children.update',
      'attendance.view',
      'attendance.create',
      'reports.view',
    ],
    MOTHER_MAID: [
      'dashboard.view',
      'children.view',
      'attendance.view',
      'attendance.create',
    ],
    WAITER: [
      'dashboard.view',
      'kitchen.view',
      'attendance.view',
      'attendance.create',
    ],
    COOK: [
      'dashboard.view',
      'kitchen.view',
      'kitchen.create',
      'kitchen.update',
      'inventory.view',
      'ration.view',
      'attendance.view',
      'attendance.create',
    ],
    COOK_HELPER: [
      'dashboard.view',
      'kitchen.view',
      'attendance.view',
      'attendance.create',
    ],
    SWEEPER: [
      'dashboard.view',
      'attendance.view',
      'attendance.create',
    ],
    SECURITY_GUARD: [
      'dashboard.view',
      'attendance.view',
      'attendance.create',
    ],
  };

  for (const [roleName, permCodes] of Object.entries(rolePermissionsMatrix)) {
    const roleId = roleMap[roleName];
    if (!roleId) continue;

    for (const code of permCodes) {
      const permissionId = permMap[code];
      if (permissionId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId,
            permissionId,
          },
        });
      }
    }
  }
  console.log('✅ Linked Role-Permission mappings');

  // 5. Seed Institutional Departments
  const departmentsData = [
    { code: 'ADM', name: 'Administration & Head of Office', description: 'Executive leadership, institutional governance, and compliance.' },
    { code: 'FIN', name: 'Finance, Accounts & Procurement', description: 'Accounting, disbursements, budgeting, and ration procurement.' },
    { code: 'HR', name: 'Human Resources & Public Relations', description: 'Staffing, welfare, attendance tracking, and duty rosters.' },
    { code: 'REC', name: 'Admissions, Records & Education', description: 'Child intake, B-Form verification, academic tracking, and archives.' },
    { code: 'CARE', name: 'Child Care & Wardenship Wing', description: '24/7 maternal care, dorm supervision, hygiene, and well-being.' },
    { code: 'MESS', name: 'Mess & Dining Hall Service', description: 'Dining hall operations, food distribution, and cleanliness.' },
    { code: 'KITCHEN', name: 'Kitchen & Food Preparation', description: 'Daily hygienic meal preparation, weekly menu cooking, and consumption.' },
    { code: 'SANITATION', name: 'Sanitation, Cleaning & Hygiene', description: 'Facility cleanliness, fumigation, laundry, and campus hygiene.' },
    { code: 'SEC', name: 'Security & Campus Safety', description: 'Perimeter protection, visitor verification, and 24/7 campus vigilance.' },
  ];

  const deptMap: Record<string, string> = {};
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, description: dept.description },
      create: dept,
    });
    deptMap[dept.code] = d.id;
  }
  console.log(`✅ Seeded ${departmentsData.length} Institutional Departments`);

  // 6. ALL 23 OFFICIAL STAFF MEMBERS
  // Total = 23. NO Warden. NO Qari Sahib or Driver as ERP accounts.
  const staffList = [
    // 1. Incharge (1)
    {
      username: 'incharge',
      email: 'farah786rao@gmail.com',
      password: adminPassword,
      role: Role.INCHARGE,
      roleName: 'INCHARGE',
      deptCode: 'ADM',
      department: 'Administration & Head of Office',
      fullName: 'Farah Malik',
      fatherHusbandName: 'Malik Noor Muhammad',
      cnic: '36302-1234567-1',
      address: 'House # 45, Officers Colony, Multan',
      phoneNumber: '0300-7301122',
      emergencyContact: '0301-8602233 (Brother: Malik Farooq)',
      notes: 'Institutional Incharge / Project Director with highest administrative & financial authority.',
      permissions: JSON.stringify(['dashboard.view', 'employees.*', 'children.*', 'finance.*', 'inventory.*', 'audit_logs.view', 'settings.*']),
    },
    // 2. Account Assistant (1)
    {
      username: 'accounts',
      email: 'farkhandabibi1986@gmail.com',
      password: accountsPassword,
      role: Role.ACCOUNT_ASSISTANT,
      roleName: 'ACCOUNT_ASSISTANT',
      deptCode: 'FIN',
      department: 'Finance, Accounts & Procurement',
      fullName: 'Farkhanda Bibi',
      fatherHusbandName: 'Muhammad Siddique',
      cnic: '36302-2345678-3',
      address: 'Street # 8, Shah Rukn-e-Alam Colony, Multan',
      phoneNumber: '0302-9451122',
      emergencyContact: '0300-6819922 (Wife: Shazia Tariq)',
      notes: 'Complete ERP operational access over Finance, Inventory, Ration, Purchases, Mess, and Children records.',
      permissions: JSON.stringify(['dashboard.view', 'finance.*', 'inventory.*', 'purchases.*', 'ration.*', 'reports.*']),
    },
    // 3. HR / Representative (1)
    {
      username: 'hr',
      email: 'tehminamehr341@gmail.com',
      password: staffPassword,
      role: Role.HR_REPRESENTATIVE,
      roleName: 'HR_REPRESENTATIVE',
      deptCode: 'HR',
      department: 'Human Resources & Public Relations',
      fullName: 'Tehmina Mehr',
      fatherHusbandName: 'Syed Ghulam Hussain',
      cnic: '36302-3456789-5',
      address: 'Mohalla Sadat, Old Shujabad Road, Multan',
      phoneNumber: '0303-4567890',
      emergencyContact: '0301-7788990 (Father: Syed Ghulam Hussain)',
      notes: 'Manages staff profiles, duty assignments, attendance tracking, leave management, and institutional correspondence.',
      permissions: JSON.stringify(['dashboard.view', 'employees.view', 'employees.create', 'employees.update', 'attendance.*', 'reports.view']),
    },
    // 4. Clerk (1)
    {
      username: 'clerk',
      email: 'umerfarooqpbm5651@gmail.com',
      password: staffPassword,
      role: Role.CLERK,
      roleName: 'CLERK',
      deptCode: 'REC',
      department: 'Admissions, Records & Education',
      fullName: 'Umer Farooq',
      fatherHusbandName: 'Bashir Ahmed Qureshi',
      cnic: '36302-4567890-7',
      address: 'Chungi No. 9, LMQ Road, Multan',
      phoneNumber: '0304-5678901',
      emergencyContact: '0302-1122334 (Cousin: Usman Qureshi)',
      notes: 'Handles children enrollment, B-Form verification, document archives, class allocations, and hostel records.',
      permissions: JSON.stringify(['dashboard.view', 'children.*', 'attendance.*', 'reports.view']),
    },
    // 5-13. Mother Maids (9)
    {
      username: 'mothermaid1',
      email: 'mothermaid1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Kaneez Fatima',
      fatherHusbandName: 'Muhammad Iqbal (Late)',
      cnic: '36302-5000001-2',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110001',
      emergencyContact: '0300-1234001 (Son: Hamza Iqbal)',
      notes: 'Senior Mother Maid. Assigned to Room 101 children. Care, hygiene, meals supervision.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid2',
      email: 'mothermaid2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Rashida Bibi',
      fatherHusbandName: 'Ghulam Rasool',
      cnic: '36302-5000002-4',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110002',
      emergencyContact: '0300-1234002 (Brother: Allah Ditta)',
      notes: 'Mother Maid. Assigned to Room 102 children.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid3',
      email: 'mothermaid3@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Nasreen Akhtar',
      fatherHusbandName: 'Muhammad Akram',
      cnic: '36302-5000003-6',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110003',
      emergencyContact: '0300-1234003 (Daughter: Maryam Akram)',
      notes: 'Mother Maid. Assigned to Room 103 children.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid4',
      email: 'mothermaid4@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Parveen Kousar',
      fatherHusbandName: 'Muhammad Rafique (Late)',
      cnic: '36302-5000004-8',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110004',
      emergencyContact: '0300-1234004 (Son: Bilal Rafique)',
      notes: 'Mother Maid. Assigned to Room 104 children.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid5',
      email: 'mothermaid5@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Shagufta Yasmeen',
      fatherHusbandName: 'Muhammad Sharif',
      cnic: '36302-5000005-0',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110005',
      emergencyContact: '0300-1234005 (Brother: Tariq Sharif)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 201.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid6',
      email: 'mothermaid6@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Zubaida Begum',
      fatherHusbandName: 'Ghulam Qadir (Late)',
      cnic: '36302-5000006-2',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110006',
      emergencyContact: '0300-1234006 (Son: Faisal Qadir)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 202.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid7',
      email: 'mothermaid7@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Farzana Kausar',
      fatherHusbandName: 'Muhammad Anwar',
      cnic: '36302-5000007-4',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110007',
      emergencyContact: '0300-1234007 (Brother: Sajid Anwar)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 203.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid8',
      email: 'mothermaid8@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Bushra Batool',
      fatherHusbandName: 'Syed Zulfiqar Ali',
      cnic: '36302-5000008-6',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110008',
      emergencyContact: '0300-1234008 (Father: Syed Mehdi Shah)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 204.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    {
      username: 'mothermaid9',
      email: 'mothermaid9@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      roleName: 'MOTHER_MAID',
      deptCode: 'CARE',
      department: 'Child Care & Wardenship Wing',
      fullName: 'Abida Parveen',
      fatherHusbandName: 'Muhammad Asif',
      cnic: '36302-5000009-8',
      address: 'Sweet Home Staff Quarters, Multan',
      phoneNumber: '0305-1110009',
      emergencyContact: '0300-1234009 (Husband: Muhammad Asif)',
      notes: 'Mother Maid. Relief & Special Care Supervisor.',
      permissions: JSON.stringify(['dashboard.view', 'children.view', 'attendance.create']),
    },
    // 14-15. Waiters (2)
    {
      username: 'waiter1',
      email: 'waiter1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.WAITER,
      roleName: 'WAITER',
      deptCode: 'MESS',
      department: 'Mess & Dining Hall Service',
      fullName: 'Muhammad Ramzan',
      fatherHusbandName: 'Allah Bakhsh',
      cnic: '36302-6000001-1',
      address: 'Basti Malook, Lodhran Road, Multan',
      phoneNumber: '0306-2220001',
      emergencyContact: '0300-9876001 (Brother: Allah Ditta)',
      notes: 'Dining hall head waiter. Responsible for breakfast, lunch, and dinner food service to children.',
      permissions: JSON.stringify(['dashboard.view', 'kitchen.view', 'attendance.create']),
    },
    {
      username: 'waiter2',
      email: 'waiter2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.WAITER,
      roleName: 'WAITER',
      deptCode: 'MESS',
      department: 'Mess & Dining Hall Service',
      fullName: 'Sajjad Hussain',
      fatherHusbandName: 'Ghulam Rasool',
      cnic: '36302-6000002-3',
      address: 'Suraj Kund Road, Multan',
      phoneNumber: '0306-2220002',
      emergencyContact: '0300-9876002 (Cousin: Zahid Hussain)',
      notes: 'Assistant waiter. Dining hall hygiene, tableware cleanliness, meal distribution.',
      permissions: JSON.stringify(['dashboard.view', 'kitchen.view', 'attendance.create']),
    },
    // 16-17. Cooks (2)
    {
      username: 'cook1',
      email: 'cook1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK,
      roleName: 'COOK',
      deptCode: 'KITCHEN',
      department: 'Kitchen & Food Preparation',
      fullName: 'Ustad Abdul Majeed',
      fatherHusbandName: 'Abdul Ghafoor',
      cnic: '36302-7000001-5',
      address: 'Lohari Gate, Old City Multan',
      phoneNumber: '0307-3330001',
      emergencyContact: '0300-6543001 (Son: Muhammad Naveed)',
      notes: 'Head Cook. Prepares daily breakfast, lunch, and dinner according to approved weekly menu.',
      permissions: JSON.stringify(['dashboard.view', 'kitchen.view', 'kitchen.create', 'kitchen.update', 'inventory.view']),
    },
    {
      username: 'cook2',
      email: 'cook2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK,
      roleName: 'COOK',
      deptCode: 'KITCHEN',
      department: 'Kitchen & Food Preparation',
      fullName: 'Muhammad Shafique',
      fatherHusbandName: 'Muhammad Sadiq',
      cnic: '36302-7000002-7',
      address: 'Gulgasht Colony, Multan',
      phoneNumber: '0307-3330002',
      emergencyContact: '0300-6543002 (Brother: Muhammad Rafique)',
      notes: 'Second Cook. Evening meals, special Friday menus, and bakery items.',
      permissions: JSON.stringify(['dashboard.view', 'kitchen.view', 'kitchen.create', 'kitchen.update', 'inventory.view']),
    },
    // 18-19. Cook Helpers (2)
    {
      username: 'cookhelper1',
      email: 'cookhelper1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK_HELPER,
      roleName: 'COOK_HELPER',
      deptCode: 'KITCHEN',
      department: 'Kitchen & Food Preparation',
      fullName: 'Muhammad Imran',
      fatherHusbandName: 'Muhammad Boota',
      cnic: '36302-8000001-9',
      address: 'Sameejabad, Multan',
      phoneNumber: '0308-4440001',
      emergencyContact: '0300-3210001 (Father: Muhammad Boota)',
      notes: 'Kitchen Helper. Vegetable chopping, kneading flour, cleaning utensils, ration fetching.',
      permissions: JSON.stringify(['dashboard.view', 'kitchen.view', 'attendance.create']),
    },
    {
      username: 'cookhelper2',
      email: 'cookhelper2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK_HELPER,
      roleName: 'COOK_HELPER',
      deptCode: 'KITCHEN',
      department: 'Kitchen & Food Preparation',
      fullName: 'Zahid Mahmood',
      fatherHusbandName: 'Ghulam Haider',
      cnic: '36302-8000002-1',
      address: 'Mumtazabad, Multan',
      phoneNumber: '0308-4440002',
      emergencyContact: '0300-3210002 (Brother: Khalid Mahmood)',
      notes: 'Kitchen Helper. Dishwashing, stock stacking, and kitchen sanitation.',
      permissions: JSON.stringify(['dashboard.view', 'kitchen.view', 'attendance.create']),
    },
    // 20-21. Sweepers (2)
    {
      username: 'sweeper1',
      email: 'sweeper1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SWEEPER,
      roleName: 'SWEEPER',
      deptCode: 'SANITATION',
      department: 'Sanitation, Cleaning & Hygiene',
      fullName: 'Babu Masih',
      fatherHusbandName: 'Sadiq Masih',
      cnic: '36302-9000001-3',
      address: 'Christian Colony, Multan Cantt',
      phoneNumber: '0309-5550001',
      emergencyContact: '0300-8520001 (Son: Robin Masih)',
      notes: 'Senior Sanitation Staff. Responsible for hostel corridors, bathrooms, and compound grounds.',
      permissions: JSON.stringify(['dashboard.view', 'attendance.create']),
    },
    {
      username: 'sweeper2',
      email: 'sweeper2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SWEEPER,
      roleName: 'SWEEPER',
      deptCode: 'SANITATION',
      department: 'Sanitation, Cleaning & Hygiene',
      fullName: 'Ashraf Masih',
      fatherHusbandName: 'Boota Masih',
      cnic: '36302-9000002-5',
      address: 'Christian Colony, Multan Cantt',
      phoneNumber: '0309-5550002',
      emergencyContact: '0300-8520002 (Brother: Yousaf Masih)',
      notes: 'Sanitation Staff. Assigned to dining hall, kitchen area, and junior wing sanitation.',
      permissions: JSON.stringify(['dashboard.view', 'attendance.create']),
    },
    // 22-23. Security Guards (2)
    {
      username: 'security1',
      email: 'security1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SECURITY_GUARD,
      roleName: 'SECURITY_GUARD',
      deptCode: 'SEC',
      department: 'Security & Campus Safety',
      fullName: 'Subedar (R) Muhammad Hanif',
      fatherHusbandName: 'Fateh Muhammad',
      cnic: '36302-0100001-7',
      address: 'Qasim Bela, Multan Cantt',
      phoneNumber: '0310-6660001',
      emergencyContact: '0300-7410001 (Son: Major Faisal Hanif)',
      notes: 'Day Shift Head Security Officer. Main gate register, visitor logging, campus perimeter patrol.',
      permissions: JSON.stringify(['dashboard.view', 'attendance.create']),
    },
    {
      username: 'security2',
      email: 'security2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SECURITY_GUARD,
      roleName: 'SECURITY_GUARD',
      deptCode: 'SEC',
      department: 'Security & Campus Safety',
      fullName: 'Havildar (R) Muhammad Akhtar',
      fatherHusbandName: 'Ghulam Qadir',
      cnic: '36302-0100002-9',
      address: 'Sher Shah Road, Multan',
      phoneNumber: '0310-6660002',
      emergencyContact: '0300-7410002 (Son: Yasir Akhtar)',
      notes: 'Night Shift Security Officer. CCTV monitoring, night gate entry verification, safety checks.',
      permissions: JSON.stringify(['dashboard.view', 'attendance.create']),
    },
  ];

  const motherMaidEmployeeIds: string[] = [];
  const createdEmployees: { id: string; role: Role; name: string }[] = [];

  for (const s of staffList) {
    const roleId = roleMap[s.roleName];
    const deptId = deptMap[s.deptCode];

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: s.email }, { username: s.username }] },
    });
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            username: s.username,
            email: s.email,
            password: s.password,
            role: s.role,
            roleId: roleId || undefined,
            permissions: s.permissions,
            status: 'ACTIVE',
          },
        })
      : await prisma.user.create({
          data: {
            username: s.username,
            email: s.email,
            password: s.password,
            role: s.role,
            roleId: roleId || undefined,
            status: 'ACTIVE',
            permissions: s.permissions,
          },
        });

    const emp = await prisma.employee.upsert({
      where: { cnic: s.cnic },
      update: {
        userId: user.id,
        fullName: s.fullName,
        fatherHusbandName: s.fatherHusbandName,
        address: s.address,
        phoneNumber: s.phoneNumber,
        role: s.role,
        roleId: roleId || undefined,
        department: s.department,
        departmentId: deptId || undefined,
        emergencyContact: s.emergencyContact,
        notes: s.notes,
        permissions: s.permissions,
      },
      create: {
        userId: user.id,
        fullName: s.fullName,
        fatherHusbandName: s.fatherHusbandName,
        cnic: s.cnic,
        address: s.address,
        phoneNumber: s.phoneNumber,
        role: s.role,
        roleId: roleId || undefined,
        department: s.department,
        departmentId: deptId || undefined,
        emergencyContact: s.emergencyContact,
        notes: s.notes,
        permissions: s.permissions,
      },
    });

    createdEmployees.push({ id: emp.id, role: s.role, name: s.fullName });
    if (s.role === Role.MOTHER_MAID) {
      motherMaidEmployeeIds.push(emp.id);
    }
  }

  console.log(`✅ Seeded ${staffList.length} staff records (All 23 sanctioned positions with individual accounts)`);

  // 7. Inventory Categories
  const categoriesData = [
    { name: 'Food / Ration', code: 'FOOD_RATION', description: 'Grains, pulses, cooking oils, sugar, spices, and non-perishables' },
    { name: 'Kitchen & Mess Supplies', code: 'KITCHEN_ITEMS', description: 'Cooking utensils, cutlery, gas cylinders, serving trays' },
    { name: 'Cleaning & Sanitation', code: 'CLEANING', description: 'Detergents, floor cleaners, soaps, brooms, disinfectants' },
    { name: 'Clothing & Bedding', code: 'CLOTHING', description: 'School uniforms, casual clothes, shoes, blankets, bed sheets' },
    { name: 'Education & Stationery', code: 'EDUCATION', description: 'Textbooks, notebooks, geometry boxes, bags, pens' },
    { name: 'Medical & First Aid', code: 'MEDICAL', description: 'Emergency medicines, band-aids, antiseptics, vitamins' },
    { name: 'General & Maintenance', code: 'GENERAL', description: 'Bulbs, electrical accessories, minor repair items' },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.inventoryCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
    categoryMap[cat.code] = created.id;
  }

  // 8. Expense Categories
  const expenseCategories = [
    { name: 'Food & Ration Expenses', description: 'Monthly ration purchases, fresh vegetables, meat, milk, and eggs' },
    { name: 'Utilities (Electricity, Gas, Water)', description: 'MEPCO electric bills, Sui Gas, water filtration' },
    { name: 'Hostel Maintenance & Repairs', description: 'Building plumbing, painting, carpentry, electrical fixes' },
    { name: 'Medical & Healthcare', description: 'Emergency medicines, specialist doctor checkups, lab tests' },
    { name: 'Education & School Supplies', description: 'Tuition support, books, school bags, exam fees' },
    { name: 'Clothing, Uniforms & Footwear', description: 'Seasonal clothing, shoes, sports uniforms' },
    { name: 'Sanitation & Hygiene Supplies', description: 'Toiletries, cleaning solutions, phenyl, insect sprays' },
    { name: 'Staff Welfare & Miscellaneous', description: 'Incidental expenses, local travel, emergency relief' },
  ];

  const expCatMap: Record<string, string> = {};
  for (const exp of expenseCategories) {
    const created = await prisma.expenseCategory.upsert({
      where: { name: exp.name },
      update: {},
      create: exp,
    });
    expCatMap[exp.name] = created.id;
  }

  // 9. Hostel Infrastructure: Buildings, Rooms, Beds
  const buildingsData = [
    {
      name: 'Allama Iqbal Block (Boys Wing)',
      code: 'BLOCK_A',
      description: 'Main residential wing with 4 spacious halls, recreation lounge, and study rooms',
      rooms: [
        { roomNumber: 'Room 101', floor: 'Ground Floor', capacity: 8 },
        { roomNumber: 'Room 102', floor: 'Ground Floor', capacity: 8 },
        { roomNumber: 'Room 103', floor: 'First Floor', capacity: 8 },
        { roomNumber: 'Room 104', floor: 'First Floor', capacity: 8 },
      ],
    },
    {
      name: 'Quaid-e-Azam Block (Junior Wing)',
      code: 'BLOCK_B',
      description: 'Junior children wing with dedicated nursery care and attached study halls',
      rooms: [
        { roomNumber: 'Room 201', floor: 'Ground Floor', capacity: 8 },
        { roomNumber: 'Room 202', floor: 'Ground Floor', capacity: 8 },
        { roomNumber: 'Room 203', floor: 'First Floor', capacity: 8 },
        { roomNumber: 'Room 204', floor: 'First Floor', capacity: 8 },
      ],
    },
  ];

  const bedList: string[] = [];
  for (const bldg of buildingsData) {
    const b = await prisma.building.upsert({
      where: { code: bldg.code },
      update: {},
      create: { name: bldg.name, code: bldg.code, description: bldg.description },
    });

    for (const r of bldg.rooms) {
      let room = await prisma.room.findFirst({
        where: { buildingId: b.id, roomNumber: r.roomNumber },
      });
      if (!room) {
        room = await prisma.room.create({
          data: {
            buildingId: b.id,
            roomNumber: r.roomNumber,
            floor: r.floor,
            capacity: r.capacity,
          },
        });
      }

      for (let i = 1; i <= r.capacity; i++) {
        const bedNumber = `BED-${r.roomNumber.replace('Room ', '')}-${i.toString().padStart(2, '0')}`;
        let bed = await prisma.bed.findFirst({
          where: { roomId: room.id, bedNumber },
        });
        if (!bed) {
          bed = await prisma.bed.create({
            data: {
              roomId: room.id,
              bedNumber,
              status: 'AVAILABLE',
            },
          });
        }
        bedList.push(bed.id);
      }
    }
  }

  // 10. Classes & Academic Structure
  const classesData = [
    { name: 'Nursery', section: 'A', schoolName: 'Sweet Home Model School Multan' },
    { name: 'Prep', section: 'A', schoolName: 'Sweet Home Model School Multan' },
    { name: 'Class 1', section: 'A', schoolName: 'Sweet Home Model School Multan' },
    { name: 'Class 2', section: 'A', schoolName: 'Sweet Home Model School Multan' },
    { name: 'Class 3', section: 'A', schoolName: 'Govt. Comprehensive High School Multan' },
    { name: 'Class 4', section: 'A', schoolName: 'Govt. Comprehensive High School Multan' },
    { name: 'Class 5', section: 'A', schoolName: 'Govt. Comprehensive High School Multan' },
    { name: 'Class 6', section: 'A', schoolName: 'Govt. Comprehensive High School Multan' },
    { name: 'Class 7', section: 'A', schoolName: 'Govt. Comprehensive High School Multan' },
    { name: 'Class 8', section: 'A', schoolName: 'Govt. Comprehensive High School Multan' },
    { name: 'Class 9', section: 'A', schoolName: 'Govt. High School Multan Cantt' },
    { name: 'Class 10', section: 'A', schoolName: 'Govt. High School Multan Cantt' },
  ];

  const classList: string[] = [];
  for (const c of classesData) {
    let createdClass = await prisma.class.findFirst({
      where: { name: c.name, section: c.section },
    });
    if (!createdClass) {
      createdClass = await prisma.class.create({
        data: {
          name: c.name,
          section: c.section,
          schoolName: c.schoolName,
          academicYear: '2025-2026',
        },
      });
    }
    classList.push(createdClass.id);
  }

  // 11. Sample Children Profiles
  const sampleChildrenData = [
    {
      childId: 'PBM-SHM-001',
      fullName: 'Muhammad Ali',
      fatherGuardianName: 'Muhammad Asif (Late)',
      dateOfBirth: new Date('2014-03-15'),
      gender: 'MALE',
      bFormNo: '36302-7890123-1',
      admissionNo: 'ADM-2022-001',
      admissionDate: new Date('2022-04-10'),
      guardianName: 'Zubaida Bibi',
      guardianRelation: 'Maternal Grandmother',
      guardianContact: '0300-8765431',
      address: 'Basti Nau, Shujabad, Multan',
      status: 'ACTIVE',
      bloodGroup: 'B+',
      allergies: 'None',
      chronicConditions: 'None',
      heightCm: 142,
      weightKg: 34.5,
    },
    {
      childId: 'PBM-SHM-002',
      fullName: 'Ahmed Raza',
      fatherGuardianName: 'Ghulam Mustafa (Late)',
      dateOfBirth: new Date('2015-07-22'),
      gender: 'MALE',
      bFormNo: '36302-8901234-3',
      admissionNo: 'ADM-2022-002',
      admissionDate: new Date('2022-05-15'),
      guardianName: 'Razia Begum',
      guardianRelation: 'Mother / Widow',
      guardianContact: '0301-7654321',
      address: 'Tibba Masoodpur, Multan',
      status: 'ACTIVE',
      bloodGroup: 'O+',
      allergies: 'Dust allergy',
      chronicConditions: 'None',
      heightCm: 135,
      weightKg: 30.0,
    },
    {
      childId: 'PBM-SHM-003',
      fullName: 'Abdullah Khan',
      fatherGuardianName: 'Muhammad Tariq Khan (Late)',
      dateOfBirth: new Date('2013-11-05'),
      gender: 'MALE',
      bFormNo: '36302-9012345-5',
      admissionNo: 'ADM-2021-008',
      admissionDate: new Date('2021-09-01'),
      guardianName: 'Sultan Khan',
      guardianRelation: 'Paternal Uncle',
      guardianContact: '0302-6543210',
      address: 'Chak 5 Faiz, Multan',
      status: 'ACTIVE',
      bloodGroup: 'A+',
      allergies: 'None',
      chronicConditions: 'None',
      heightCm: 148,
      weightKg: 38.0,
    },
    {
      childId: 'PBM-SHM-004',
      fullName: 'Bilal Hassan',
      fatherGuardianName: 'Hassan Raza (Late)',
      dateOfBirth: new Date('2016-02-18'),
      gender: 'MALE',
      bFormNo: '36302-0123456-7',
      admissionNo: 'ADM-2023-014',
      admissionDate: new Date('2023-03-01'),
      guardianName: 'Fatima Hassan',
      guardianRelation: 'Aunt',
      guardianContact: '0303-5432109',
      address: 'Lutfabad, Multan',
      status: 'ACTIVE',
      bloodGroup: 'AB+',
      allergies: 'Penicillin',
      chronicConditions: 'Mild Asthma',
      heightCm: 128,
      weightKg: 26.5,
    },
  ];

  for (let i = 0; i < sampleChildrenData.length; i++) {
    const c = sampleChildrenData[i];
    const assignedBedId = bedList[i % bedList.length];
    const assignedClassId = classList[i % classList.length];
    const assignedMotherMaidId = motherMaidEmployeeIds[i % motherMaidEmployeeIds.length];

    if (assignedBedId) {
      await prisma.bed.update({
        where: { id: assignedBedId },
        data: { status: 'OCCUPIED' },
      });
    }

    const bedRecord = assignedBedId ? await prisma.bed.findUnique({ where: { id: assignedBedId } }) : null;

    const child = await prisma.child.upsert({
      where: { childId: c.childId },
      update: {},
      create: {
        childId: c.childId,
        fullName: c.fullName,
        fatherGuardianName: c.fatherGuardianName,
        dateOfBirth: c.dateOfBirth,
        gender: c.gender,
        bFormNo: c.bFormNo,
        admissionNo: c.admissionNo,
        admissionDate: c.admissionDate,
        guardianName: c.guardianName,
        guardianRelation: c.guardianRelation,
        guardianContact: c.guardianContact,
        address: c.address,
        status: c.status,
        motherMaidId: assignedMotherMaidId,
        roomId: bedRecord?.roomId,
        bedId: assignedBedId,
        classId: assignedClassId,
        clothingIssued: '2 Sets School Uniform, 1 Winter Jacket, 2 Casual Pairs, 1 Pair Black Shoes, 1 Pair Joggers',
        dietaryNotes: 'Full standard nutritious diet with daily milk and seasonal fruits',
        notes: 'Enrolled under Pakistan Bait-ul-Maal Welfare Scheme. Living in Sweet Home hostel.',
      },
    });

    await prisma.medicalRecord.upsert({
      where: { childId: child.id },
      update: {},
      create: {
        childId: child.id,
        bloodGroup: c.bloodGroup,
        allergies: c.allergies,
        chronicConditions: c.chronicConditions,
        heightCm: c.heightCm,
        weightKg: c.weightKg,
        emergencyNotes: 'Contact Sweet Home Medical Officer / Incharge immediately in case of emergency.',
      },
    });
  }

  // 12. Inventory Items
  const inventoryItemsData = [
    { name: 'Super Basmati Rice (Karnal)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 350, minStock: 50, supplier: 'Al-Madina Grain Merchant Multan' },
    { name: 'Wheat Flour (Chakki Atta)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 800, minStock: 100, supplier: 'Multan Flour Mills' },
    { name: 'Cooking Oil (Canola/Ghee 16L)', categoryCode: 'FOOD_RATION', unit: 'tin (16L)', currentStock: 18, minStock: 5, supplier: 'Chenab General Store Multan' },
    { name: 'Daal Chana Special', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 120, minStock: 25, supplier: 'Al-Madina Grain Merchant' },
    { name: 'Daal Moong Washed', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 90, minStock: 20, supplier: 'Al-Madina Grain Merchant' },
    { name: 'White Sugar (Refined)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 200, minStock: 40, supplier: 'Chenab General Store' },
    { name: 'Tea Leaves (Supreme Black)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 35, minStock: 10, supplier: 'Chenab General Store' },
    { name: 'Fresh Milk (Daily supply)', categoryCode: 'FOOD_RATION', unit: 'liters', currentStock: 60, minStock: 20, supplier: 'Bismillah Dairy Farm Multan' },
    { name: 'Lifebuoy / Dettol Bath Soap', categoryCode: 'CLEANING', unit: 'bars', currentStock: 150, minStock: 30, supplier: 'Chenab General Store' },
    { name: 'Surf Excel Detergent Powder', categoryCode: 'CLEANING', unit: 'kg', currentStock: 80, minStock: 20, supplier: 'Chenab General Store' },
  ];

  for (const item of inventoryItemsData) {
    const catId = categoryMap[item.categoryCode];
    if (catId) {
      const existing = await prisma.inventoryItem.findFirst({ where: { name: item.name } });
      if (!existing) {
        await prisma.inventoryItem.create({
          data: {
            name: item.name,
            categoryId: catId,
            unit: item.unit,
            currentStock: item.currentStock,
            minStock: item.minStock,
            supplier: item.supplier,
            status: item.currentStock <= item.minStock ? 'LOW_STOCK' : 'IN_STOCK',
            notes: 'Standard authorized stock for sweet home campus operations',
          },
        });
      }
    }
  }

  // 13. Daily Weekly Menu
  const weeklyMenu = [
    {
      dayOfWeek: 'MONDAY',
      breakfastMenu: 'آملیٹ، پراٹھا، چائے',
      lunchMenu: 'بیف آلو، روٹی، زردہ',
      dinnerMenu: 'دال چنا، روٹی',
      notes: 'پاکستان بیت المال، PSH ملتان کا معیاری مینو 2024',
    },
    {
      dayOfWeek: 'TUESDAY',
      breakfastMenu: 'آلو کے بھجئے، پراٹھا، چائے',
      lunchMenu: 'سکس سبزی، روٹی، فروٹ',
      dinnerMenu: 'لوبیا، روٹی',
      notes: 'پاکستان بیت المال، PSH ملتان کا معیاری مینو 2024',
    },
    {
      dayOfWeek: 'WEDNESDAY',
      breakfastMenu: 'چنے، پراٹھا، چائے',
      lunchMenu: 'چکن بریانی، رائتہ',
      dinnerMenu: 'مس دال، روٹی',
      notes: 'پاکستان بیت المال، PSH ملتان کا معیاری مینو 2024',
    },
    {
      dayOfWeek: 'THURSDAY',
      breakfastMenu: 'آلو انڈہ، پراٹھا، چائے',
      lunchMenu: 'کڑھی پکوڑا، روٹی، حلوہ',
      dinnerMenu: 'چکن قورمہ، روٹی',
      notes: 'پاکستان بیت المال، PSH ملتان کا معیاری مینو 2024',
    },
    {
      dayOfWeek: 'FRIDAY',
      breakfastMenu: 'چنے، پراٹھا، چائے',
      lunchMenu: 'چنا پلاؤ، رائتہ، فروٹ',
      dinnerMenu: 'مس سبزی، روٹی',
      notes: 'پاکستان بیت المال، PSH ملتان کا معیاری مینو 2024',
    },
    {
      dayOfWeek: 'SATURDAY',
      breakfastMenu: 'آلو انڈہ، پراٹھا، چائے',
      lunchMenu: 'دال ماش، روٹی',
      dinnerMenu: 'چکن چاول، روٹی',
      notes: 'پاکستان بیت المال، PSH ملتان کا معیاری مینو 2024',
    },
    {
      dayOfWeek: 'SUNDAY',
      breakfastMenu: 'چنے، پراٹھا، چائے',
      lunchMenu: 'مٹر پلاؤ اور دال چاول',
      dinnerMenu: 'لوبیا، روٹی',
      notes: 'پاکستان بیت المال، PSH ملتان کا معیاری مینو 2024',
    },
  ];

  for (const m of weeklyMenu) {
    await prisma.dailyMenu.upsert({
      where: { dayOfWeek: m.dayOfWeek },
      update: m,
      create: m,
    });
  }

  // 14. Suppliers
  const suppliersData = [
    { name: 'Al-Madina Grain Merchant Multan', contactPerson: 'Haji Muhammad Asghar', phone: '0300-7355112', email: 'almadina.grains@gmail.com', address: 'Grain Market, Chowk Kumharanwala, Multan', ntn: '1234567-8' },
    { name: 'Multan Flour Mills Ltd.', contactPerson: 'Sheikh Tariq Mahmood', phone: '0301-8644221', email: 'orders@multanflour.com.pk', address: 'Industrial Estate Phase 1, Multan', ntn: '2345678-9' },
    { name: 'Chenab General Store & Ration Suppliers', contactPerson: 'Malik Zafar Iqbal', phone: '0302-9533110', email: 'chenab.ration@yahoo.com', address: 'Hussain Agahi Bazar, Multan', ntn: '3456789-0' },
  ];

  for (const sup of suppliersData) {
    const existing = await prisma.supplier.findFirst({ where: { name: sup.name } });
    if (!existing) {
      await prisma.supplier.create({ data: sup });
    }
  }

  // 15. System Settings
  const settingsData = [
    { key: 'INSTITUTION_NAME', value: 'Pakistan Bait-ul-Maal Sweet Home Multan', group: 'INSTITUTION', description: 'Official name of the welfare facility' },
    { key: 'INSTITUTION_CODE', value: 'PBM-SH-MUL-01', group: 'INSTITUTION', description: 'Government registry code' },
    { key: 'LOCATION_ADDRESS', value: 'Sweet Home Complex, Near Eidgah, LMQ Road, Multan, Punjab, Pakistan', group: 'INSTITUTION', description: 'Physical address' },
    { key: 'TOTAL_STAFF_SANCTIONED', value: '23', group: 'HR', description: 'Sanctioned strength of official staff members' },
    { key: 'EMERGENCY_CONTACT_1', value: '061-9200450 (Sweet Home Control Room)', group: 'SECURITY', description: '24/7 Control Helpline' },
  ];

  for (const set of settingsData) {
    await prisma.systemSetting.upsert({
      where: { key: set.key },
      update: { value: set.value },
      create: set,
    });
  }

  // 16. Initial Audit Log
  const inchargeUser = await prisma.user.findUnique({ where: { email: 'incharge@sweethome.pbm.gov.pk' } });
  if (inchargeUser) {
    await prisma.auditLog.create({
      data: {
        userId: inchargeUser.id,
        userEmail: inchargeUser.email,
        action: 'SYSTEM_INIT',
        module: 'SETTINGS',
        recordId: 'INIT-001',
        details: 'Initial system configuration, database models, RBAC permissions, and 23 staff accounts seeded.',
        ipAddress: '127.0.0.1',
      },
    });
  }

  console.log('🎉 Sweet Home Multan ERP Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
