import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sweet Home Multan ERP database seed...');

  // 1. Hash default passwords
  const adminPassword = await bcrypt.hash('PBM@Admin2026!', 10);
  const accountsPassword = await bcrypt.hash('PBM@Accounts2026!', 10);
  const staffPassword = await bcrypt.hash('PBM@Staff2026!', 10);

  // 2. Inventory Categories
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

  // 3. Expense Categories
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

  // 4. Hostel Infrastructure: Buildings, Rooms, Beds
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
      const room = await prisma.room.create({
        data: {
          buildingId: b.id,
          roomNumber: r.roomNumber,
          floor: r.floor,
          capacity: r.capacity,
        },
      });

      for (let i = 1; i <= r.capacity; i++) {
        const bed = await prisma.bed.create({
          data: {
            roomId: room.id,
            bedNumber: `BED-${r.roomNumber.replace('Room ', '')}-${i.toString().padStart(2, '0')}`,
            status: 'AVAILABLE',
          },
        });
        bedList.push(bed.id);
      }
    }
  }

  // 5. Classes & Academic Structure
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
    const createdClass = await prisma.class.create({
      data: {
        name: c.name,
        section: c.section,
        schoolName: c.schoolName,
        academicYear: '2025-2026',
      },
    });
    classList.push(createdClass.id);
  }

  // 6. ALL 23 OFFICIAL STAFF MEMBERS (Exact structure: 1 Incharge, 1 Accounts, 1 HR, 1 Clerk, 9 Mother Maids, 2 Waiters, 2 Cooks, 2 Cook Helpers, 2 Sweepers, 2 Security Guards)
  // Total = 23. NO Warden. NO Joining Date.
  const staffList = [
    // 1. Incharge (1)
    {
      username: 'incharge',
      email: 'incharge@sweethome.pbm.gov.pk',
      password: adminPassword,
      role: Role.INCHARGE,
      fullName: 'Malik Muhammad Aslam',
      fatherHusbandName: 'Malik Noor Muhammad',
      cnic: '36302-1234567-1',
      address: 'House # 45, Officers Colony, Multan',
      phoneNumber: '0300-7301122',
      department: 'Administration & Head of Office',
      emergencyContact: '0301-8602233 (Brother: Malik Farooq)',
      notes: 'Institutional Incharge / Project Director with highest administrative & financial authority.',
      permissions: JSON.stringify(['ALL_MODULES', 'ADMIN_ACCESS', 'AUDIT_VIEW', 'FINANCIAL_APPROVAL']),
    },
    // 2. Account Assistant (1)
    {
      username: 'accounts',
      email: 'accounts@sweethome.pbm.gov.pk',
      password: accountsPassword,
      role: Role.ACCOUNT_ASSISTANT,
      fullName: 'Muhammad Tariq Javed',
      fatherHusbandName: 'Muhammad Siddique',
      cnic: '36302-2345678-3',
      address: 'Street # 8, Shah Rukn-e-Alam Colony, Multan',
      phoneNumber: '0302-9451122',
      department: 'Finance, Accounts & Procurement',
      emergencyContact: '0300-6819922 (Wife: Shazia Tariq)',
      notes: 'Complete ERP operational access over Finance, Inventory, Ration, Purchases, Mess, and Children records.',
      permissions: JSON.stringify(['FINANCE_ALL', 'INVENTORY_ALL', 'PURCHASES_ALL', 'REPORTS_ALL', 'CHILDREN_VIEW', 'MESS_ALL']),
    },
    // 3. HR / Representative (1)
    {
      username: 'hr',
      email: 'hr@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.HR_REPRESENTATIVE,
      fullName: 'Syed Ali Raza Rizvi',
      fatherHusbandName: 'Syed Ghulam Hussain',
      cnic: '36302-3456789-5',
      address: 'Mohalla Sadat, Old Shujabad Road, Multan',
      phoneNumber: '0303-4567890',
      department: 'Human Resources & Public Relations',
      emergencyContact: '0301-7788990 (Father: Syed Ghulam Hussain)',
      notes: 'Manages staff profiles, duty assignments, attendance tracking, leave management, and institutional correspondence.',
      permissions: JSON.stringify(['STAFF_ALL', 'ATTENDANCE_STAFF', 'DUTIES_ALL', 'HR_REPORTS']),
    },
    // 4. Clerk (1)
    {
      username: 'clerk',
      email: 'clerk@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.CLERK,
      fullName: 'Abdul Rehman Qureshi',
      fatherHusbandName: 'Bashir Ahmed Qureshi',
      cnic: '36302-4567890-7',
      address: 'Chungi No. 9, LMQ Road, Multan',
      phoneNumber: '0304-5678901',
      department: 'Admissions, Records & Education',
      emergencyContact: '0302-1122334 (Cousin: Usman Qureshi)',
      notes: 'Handles children enrollment, B-Form verification, document archives, class allocations, and hostel records.',
      permissions: JSON.stringify(['CHILDREN_ALL', 'EDUCATION_ALL', 'HOSTEL_VIEW', 'ATTENDANCE_CHILDREN', 'DOCUMENTS_ALL']),
    },
    // 5-13. Mother Maids (9)
    {
      username: 'mothermaid1',
      email: 'mothermaid1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Kaneez Fatima',
      fatherHusbandName: 'Muhammad Iqbal (Late)',
      cnic: '36302-5000001-2',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110001',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234001 (Son: Hamza Iqbal)',
      notes: 'Senior Mother Maid. Assigned to Room 101 children. Care, hygiene, meals supervision.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid2',
      email: 'mothermaid2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Rashida Bibi',
      fatherHusbandName: 'Ghulam Rasool',
      cnic: '36302-5000002-4',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110002',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234002 (Brother: Allah Ditta)',
      notes: 'Mother Maid. Assigned to Room 102 children.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid3',
      email: 'mothermaid3@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Nasreen Akhtar',
      fatherHusbandName: 'Muhammad Akram',
      cnic: '36302-5000003-6',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110003',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234003 (Daughter: Maryam Akram)',
      notes: 'Mother Maid. Assigned to Room 103 children.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid4',
      email: 'mothermaid4@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Parveen Kousar',
      fatherHusbandName: 'Muhammad Rafique (Late)',
      cnic: '36302-5000004-8',
      address: 'Sweet Home Staff Quarters, Block A, Multan',
      phoneNumber: '0305-1110004',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234004 (Son: Bilal Rafique)',
      notes: 'Mother Maid. Assigned to Room 104 children.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid5',
      email: 'mothermaid5@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Shagufta Yasmeen',
      fatherHusbandName: 'Muhammad Sharif',
      cnic: '36302-5000005-0',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110005',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234005 (Brother: Tariq Sharif)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 201.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid6',
      email: 'mothermaid6@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Zubaida Begum',
      fatherHusbandName: 'Ghulam Qadir (Late)',
      cnic: '36302-5000006-2',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110006',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234006 (Son: Faisal Qadir)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 202.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid7',
      email: 'mothermaid7@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Farzana Kausar',
      fatherHusbandName: 'Muhammad Anwar',
      cnic: '36302-5000007-4',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110007',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234007 (Brother: Sajid Anwar)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 203.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid8',
      email: 'mothermaid8@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Bushra Batool',
      fatherHusbandName: 'Syed Zulfiqar Ali',
      cnic: '36302-5000008-6',
      address: 'Sweet Home Staff Quarters, Block B, Multan',
      phoneNumber: '0305-1110008',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234008 (Father: Syed Mehdi Shah)',
      notes: 'Mother Maid. Assigned to Junior Wing Room 204.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    {
      username: 'mothermaid9',
      email: 'mothermaid9@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.MOTHER_MAID,
      fullName: 'Abida Parveen',
      fatherHusbandName: 'Muhammad Asif',
      cnic: '36302-5000009-8',
      address: 'Sweet Home Staff Quarters, Multan',
      phoneNumber: '0305-1110009',
      department: 'Child Care & Wardenship Wing',
      emergencyContact: '0300-1234009 (Husband: Muhammad Asif)',
      notes: 'Mother Maid. Relief & Special Care Supervisor.',
      permissions: JSON.stringify(['MY_CHILDREN', 'CARE_DUTY_LOG', 'CHILD_HEALTH_NOTES']),
    },
    // 14-15. Waiters (2)
    {
      username: 'waiter1',
      email: 'waiter1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.WAITER,
      fullName: 'Muhammad Ramzan',
      fatherHusbandName: 'Allah Bakhsh',
      cnic: '36302-6000001-1',
      address: 'Basti Malook, Lodhran Road, Multan',
      phoneNumber: '0306-2220001',
      department: 'Mess & Dining Hall Service',
      emergencyContact: '0300-9876001 (Brother: Allah Ditta)',
      notes: 'Dining hall head waiter. Responsible for breakfast, lunch, and dinner food service to children.',
      permissions: JSON.stringify(['MESS_SERVING', 'DINING_DUTY_LOG']),
    },
    {
      username: 'waiter2',
      email: 'waiter2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.WAITER,
      fullName: 'Sajjad Hussain',
      fatherHusbandName: 'Ghulam Rasool',
      cnic: '36302-6000002-3',
      address: 'Suraj Kund Road, Multan',
      phoneNumber: '0306-2220002',
      department: 'Mess & Dining Hall Service',
      emergencyContact: '0300-9876002 (Cousin: Zahid Hussain)',
      notes: 'Assistant waiter. Dining hall hygiene, tableware cleanliness, meal distribution.',
      permissions: JSON.stringify(['MESS_SERVING', 'DINING_DUTY_LOG']),
    },
    // 16-17. Cooks (2)
    {
      username: 'cook1',
      email: 'cook1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK,
      fullName: 'Ustad Abdul Majeed',
      fatherHusbandName: 'Abdul Ghafoor',
      cnic: '36302-7000001-5',
      address: 'Lohari Gate, Old City Multan',
      phoneNumber: '0307-3330001',
      department: 'Kitchen & Food Preparation',
      emergencyContact: '0300-6543001 (Son: Muhammad Naveed)',
      notes: 'Head Cook. Prepares daily breakfast, lunch, and dinner according to approved weekly menu.',
      permissions: JSON.stringify(['KITCHEN_MENU', 'KITCHEN_CONSUMPTION', 'KITCHEN_REQUESTS']),
    },
    {
      username: 'cook2',
      email: 'cook2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK,
      fullName: 'Muhammad Shafique',
      fatherHusbandName: 'Muhammad Sadiq',
      cnic: '36302-7000002-7',
      address: 'Gulgasht Colony, Multan',
      phoneNumber: '0307-3330002',
      department: 'Kitchen & Food Preparation',
      emergencyContact: '0300-6543002 (Brother: Muhammad Rafique)',
      notes: 'Second Cook. Evening meals, special Friday menus, and bakery items.',
      permissions: JSON.stringify(['KITCHEN_MENU', 'KITCHEN_CONSUMPTION', 'KITCHEN_REQUESTS']),
    },
    // 18-19. Cook Helpers (2)
    {
      username: 'cookhelper1',
      email: 'cookhelper1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK_HELPER,
      fullName: 'Muhammad Imran',
      fatherHusbandName: 'Muhammad Boota',
      cnic: '36302-8000001-9',
      address: 'Sameejabad, Multan',
      phoneNumber: '0308-4440001',
      department: 'Kitchen & Food Preparation',
      emergencyContact: '0300-3210001 (Father: Muhammad Boota)',
      notes: 'Kitchen Helper. Vegetable chopping, kneading flour, cleaning utensils, ration fetching.',
      permissions: JSON.stringify(['KITCHEN_TASKS', 'DUTY_LOG']),
    },
    {
      username: 'cookhelper2',
      email: 'cookhelper2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.COOK_HELPER,
      fullName: 'Zahid Mahmood',
      fatherHusbandName: 'Ghulam Haider',
      cnic: '36302-8000002-1',
      address: 'Mumtazabad, Multan',
      phoneNumber: '0308-4440002',
      department: 'Kitchen & Food Preparation',
      emergencyContact: '0300-3210002 (Brother: Khalid Mahmood)',
      notes: 'Kitchen Helper. Dishwashing, stock stacking, and kitchen sanitation.',
      permissions: JSON.stringify(['KITCHEN_TASKS', 'DUTY_LOG']),
    },
    // 20-21. Sweepers (2)
    {
      username: 'sweeper1',
      email: 'sweeper1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SWEEPER,
      fullName: 'Babu Masih',
      fatherHusbandName: 'Sadiq Masih',
      cnic: '36302-9000001-3',
      address: 'Christian Colony, Multan Cantt',
      phoneNumber: '0309-5550001',
      department: 'Sanitation, Cleaning & Hygiene',
      emergencyContact: '0300-8520001 (Son: Robin Masih)',
      notes: 'Senior Sanitation Staff. Responsible for hostel corridors, bathrooms, and compound grounds.',
      permissions: JSON.stringify(['CLEANING_TASKS', 'DUTY_LOG']),
    },
    {
      username: 'sweeper2',
      email: 'sweeper2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SWEEPER,
      fullName: 'Ashraf Masih',
      fatherHusbandName: 'Boota Masih',
      cnic: '36302-9000002-5',
      address: 'Christian Colony, Multan Cantt',
      phoneNumber: '0309-5550002',
      department: 'Sanitation, Cleaning & Hygiene',
      emergencyContact: '0300-8520002 (Brother: Yousaf Masih)',
      notes: 'Sanitation Staff. Assigned to dining hall, kitchen area, and junior wing sanitation.',
      permissions: JSON.stringify(['CLEANING_TASKS', 'DUTY_LOG']),
    },
    // 22-23. Security Guards (2)
    {
      username: 'security1',
      email: 'security1@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SECURITY_GUARD,
      fullName: 'Subedar (R) Muhammad Hanif',
      fatherHusbandName: 'Fateh Muhammad',
      cnic: '36302-0100001-7',
      address: 'Qasim Bela, Multan Cantt',
      phoneNumber: '0310-6660001',
      department: 'Security & Campus Safety',
      emergencyContact: '0300-7410001 (Son: Major Faisal Hanif)',
      notes: 'Day Shift Head Security Officer. Main gate register, visitor logging, campus perimeter patrol.',
      permissions: JSON.stringify(['GATE_REGISTER', 'VISITOR_LOG', 'DUTY_LOG']),
    },
    {
      username: 'security2',
      email: 'security2@sweethome.pbm.gov.pk',
      password: staffPassword,
      role: Role.SECURITY_GUARD,
      fullName: 'Havildar (R) Muhammad Akhtar',
      fatherHusbandName: 'Ghulam Qadir',
      cnic: '36302-0100002-9',
      address: 'Sher Shah Road, Multan',
      phoneNumber: '0310-6660002',
      department: 'Security & Campus Safety',
      emergencyContact: '0300-7410002 (Son: Yasir Akhtar)',
      notes: 'Night Shift Security Officer. CCTV monitoring, night gate entry verification, safety checks.',
      permissions: JSON.stringify(['GATE_REGISTER', 'VISITOR_LOG', 'DUTY_LOG']),
    },
  ];

  const motherMaidEmployeeIds: string[] = [];
  const createdEmployees: { id: string; role: Role; name: string }[] = [];

  for (const s of staffList) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        password: s.password,
        role: s.role,
        permissions: s.permissions,
      },
      create: {
        username: s.username,
        email: s.email,
        password: s.password,
        role: s.role,
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
        department: s.department,
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
        department: s.department,
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

  console.log(`✅ Created ${staffList.length} staff records (All 23 positions with individual accounts)`);

  // 7. Sample Children Profiles with assignments
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
    {
      childId: 'PBM-SHM-005',
      fullName: 'Zain Abbas',
      fatherGuardianName: 'Syed Abbas Ali (Late)',
      dateOfBirth: new Date('2015-09-30'),
      gender: 'MALE',
      bFormNo: '36302-1234509-9',
      admissionNo: 'ADM-2023-019',
      admissionDate: new Date('2023-04-12'),
      guardianName: 'Syeda Batool',
      guardianRelation: 'Mother',
      guardianContact: '0304-4321098',
      address: 'Shah Shams Colony, Multan',
      status: 'ACTIVE',
      bloodGroup: 'O-',
      allergies: 'None',
      chronicConditions: 'None',
      heightCm: 136,
      weightKg: 31.0,
    },
    {
      childId: 'PBM-SHM-006',
      fullName: 'Hamza Tariq',
      fatherGuardianName: 'Tariq Mehmood (Late)',
      dateOfBirth: new Date('2014-06-10'),
      gender: 'MALE',
      bFormNo: '36302-2345098-1',
      admissionNo: 'ADM-2022-031',
      admissionDate: new Date('2022-08-20'),
      guardianName: 'Shahnaz Tariq',
      guardianRelation: 'Mother',
      guardianContact: '0305-3210987',
      address: 'Makhdoom Rashid, Multan',
      status: 'ACTIVE',
      bloodGroup: 'B+',
      allergies: 'None',
      chronicConditions: 'None',
      heightCm: 140,
      weightKg: 33.0,
    },
    {
      childId: 'PBM-SHM-007',
      fullName: 'Umar Farooq',
      fatherGuardianName: 'Farooq Ahmed (Late)',
      dateOfBirth: new Date('2017-01-25'),
      gender: 'MALE',
      bFormNo: '36302-3456109-3',
      admissionNo: 'ADM-2024-005',
      admissionDate: new Date('2024-01-10'),
      guardianName: 'Naseem Akhtar',
      guardianRelation: 'Grandmother',
      guardianContact: '0306-2109876',
      address: 'Jahangirabad, Khanewal Road, Multan',
      status: 'ACTIVE',
      bloodGroup: 'A+',
      allergies: 'None',
      chronicConditions: 'None',
      heightCm: 120,
      weightKg: 22.0,
    },
    {
      childId: 'PBM-SHM-008',
      fullName: 'Usman Ghani',
      fatherGuardianName: 'Muhammad Ghani (Late)',
      dateOfBirth: new Date('2016-12-14'),
      gender: 'MALE',
      bFormNo: '36302-4567210-5',
      admissionNo: 'ADM-2024-011',
      admissionDate: new Date('2024-02-15'),
      guardianName: 'Gulshan Bibi',
      guardianRelation: 'Mother',
      guardianContact: '0307-1098765',
      address: 'Basti Khudadad, Multan',
      status: 'ACTIVE',
      bloodGroup: 'B-',
      allergies: 'None',
      chronicConditions: 'None',
      heightCm: 124,
      weightKg: 24.5,
    },
  ];

  const createdChildren = [];
  for (let i = 0; i < sampleChildrenData.length; i++) {
    const c = sampleChildrenData[i];
    const assignedBedId = bedList[i % bedList.length];
    const assignedClassId = classList[i % classList.length];
    const assignedMotherMaidId = motherMaidEmployeeIds[i % motherMaidEmployeeIds.length];

    // Mark bed as occupied
    await prisma.bed.update({
      where: { id: assignedBedId },
      data: { status: 'OCCUPIED' },
    });

    const bedRecord = await prisma.bed.findUnique({ where: { id: assignedBedId } });

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

    // Medical Record
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

    // Education Record
    await prisma.educationRecord.create({
      data: {
        childId: child.id,
        classId: assignedClassId,
        academicYear: '2024-2025',
        schoolName: 'Sweet Home Model School Multan',
        examTerm: 'Mid Term Exam',
        totalMarks: 500,
        obtainedMarks: 410 + (i * 10),
        grade: 'A',
        remarks: 'Excellent discipline and regular attendance. Shows keen interest in mathematics and arts.',
      },
    });

    createdChildren.push(child);
  }

  console.log(`✅ Created ${createdChildren.length} children profiles with medical, hostel & academic links`);

  // 8. Inventory Items (Grains, Oils, Hygiene, School items)
  const inventoryItemsData = [
    { name: 'Super Basmati Rice (Karnal)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 350, minStock: 50, supplier: 'Al-Madina Grain Merchant Multan' },
    { name: 'Wheat Flour (Chakki Atta)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 800, minStock: 100, supplier: 'Multan Flour Mills' },
    { name: 'Cooking Oil (Canola/Ghee 16L)', categoryCode: 'FOOD_RATION', unit: 'tin (16L)', currentStock: 18, minStock: 5, supplier: 'Chenab General Store Multan' },
    { name: 'Daal Chana Special', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 120, minStock: 25, supplier: 'Al-Madina Grain Merchant' },
    { name: 'Daal Moong Washed', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 90, minStock: 20, supplier: 'Al-Madina Grain Merchant' },
    { name: 'White Sugar (Refined)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 200, minStock: 40, supplier: 'Chenab General Store' },
    { name: 'Tea Leaves (Supreme Black)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 35, minStock: 10, supplier: 'Chenab General Store' },
    { name: 'Fresh Milk (Daily supply)', categoryCode: 'FOOD_RATION', unit: 'liters', currentStock: 60, minStock: 20, supplier: 'Bismillah Dairy Farm Multan' },
    { name: 'Poultry Chicken (Fresh)', categoryCode: 'FOOD_RATION', unit: 'kg', currentStock: 40, minStock: 15, supplier: 'Madina Broiler Shop Multan' },
    { name: 'Lifebuoy / Dettol Bath Soap', categoryCode: 'CLEANING', unit: 'bars', currentStock: 150, minStock: 30, supplier: 'Chenab General Store' },
    { name: 'Surf Excel Detergent Powder', categoryCode: 'CLEANING', unit: 'kg', currentStock: 80, minStock: 20, supplier: 'Chenab General Store' },
    { name: 'Phenyl Disinfectant Bottles', categoryCode: 'CLEANING', unit: 'bottles (3L)', currentStock: 25, minStock: 8, supplier: 'Chenab General Store' },
    { name: 'PBM School Uniform Sets (Boys)', categoryCode: 'CLOTHING', unit: 'sets', currentStock: 45, minStock: 15, supplier: 'National Uniform Tailors Multan' },
    { name: 'Black Leather School Shoes', categoryCode: 'CLOTHING', unit: 'pairs', currentStock: 30, minStock: 10, supplier: 'Bata / Service Store Multan' },
    { name: 'School Notebooks (Single Line)', categoryCode: 'EDUCATION', unit: 'copies', currentStock: 250, minStock: 50, supplier: 'Kitab Markaz Multan' },
    { name: 'Ballpoint Pens (Blue/Black pack)', categoryCode: 'EDUCATION', unit: 'packets', currentStock: 40, minStock: 10, supplier: 'Kitab Markaz Multan' },
    { name: 'Panadol Syrup 120ml', categoryCode: 'MEDICAL', unit: 'bottles', currentStock: 20, minStock: 5, supplier: 'Shifa Medicos Multan' },
    { name: 'Disinfectant Bandage Strips', categoryCode: 'MEDICAL', unit: 'box (100s)', currentStock: 12, minStock: 4, supplier: 'Shifa Medicos Multan' },
  ];

  for (const item of inventoryItemsData) {
    const catId = categoryMap[item.categoryCode];
    if (catId) {
      const createdItem = await prisma.inventoryItem.create({
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

      // Initial stock transaction
      await prisma.stockTransaction.create({
        data: {
          itemId: createdItem.id,
          transactionType: 'STOCK_IN',
          quantity: item.currentStock,
          unit: item.unit,
          responsiblePerson: 'Muhammad Tariq Javed (Account Assistant)',
          reason: 'Initial Opening Balance for ERP initialization',
        },
      });
    }
  }

  console.log(`✅ Seeded ${inventoryItemsData.length} Inventory & Ration items with transactions`);

  // 9. Daily Weekly Menu (Monday to Sunday)
  const weeklyMenu = [
    {
      dayOfWeek: 'MONDAY',
      breakfastMenu: 'Paratha, Fried Eggs / Omelette, Fresh Milk / Tea',
      lunchMenu: 'Daal Chana Special, Steamed Rice, Fresh Salad, Yogurt Raita',
      dinnerMenu: 'Chicken Karahi / Korma, Tandoori Roti, Fresh Mint Raita',
      notes: 'Standard balanced nutritious menu for 100+ children and duty staff',
    },
    {
      dayOfWeek: 'TUESDAY',
      breakfastMenu: 'Bread Butter / Jam, Boiled Eggs, Sweet Milk',
      lunchMenu: 'Aloo Gosht Gravy, Fresh Chapati, Seasonal Salad',
      dinnerMenu: 'Daal Moong, Plain White Rice, Green Chutney',
      notes: 'Wholesome dinner with digestive lentils and fresh salad',
    },
    {
      dayOfWeek: 'WEDNESDAY',
      breakfastMenu: 'Halwa Puri / Chana, Fresh Lassi / Sweet Milk',
      lunchMenu: 'Chicken Pulao with Shami Kabab, Cucumber Raita',
      dinnerMenu: 'Mix Vegetable Curry (Sabzi), Fresh Hot Tandoori Roti',
      notes: 'Special Wednesday lunch with high protein chicken pulao',
    },
    {
      dayOfWeek: 'THURSDAY',
      breakfastMenu: 'Stuffed Aloo Paratha, Curd / Chutney, Tea / Milk',
      lunchMenu: 'Kadhi Pakora, Steamed White Basmati Rice, Onion Salad',
      dinnerMenu: 'Chicken Haleem / Nihari, Naan, Lemon & Ginger Garnish',
      notes: 'Traditional nutritious meals rich in vitamins and protein',
    },
    {
      dayOfWeek: 'FRIDAY',
      breakfastMenu: 'Paratha, Omelette with Onion & Green Chillies, Tea / Hot Milk',
      lunchMenu: 'Special Chicken Biryani, Shami Kabab, Zeera Raita, Cold Kheer / Sweet',
      dinnerMenu: 'Daal Mash Special with Butter Tarka, Hot Tandoori Chapati',
      notes: 'Special Friday Feast for all children and campus residents',
    },
    {
      dayOfWeek: 'SATURDAY',
      breakfastMenu: 'Poached / Scrambled Eggs, Bread Slices, Butter, Warm Milk',
      lunchMenu: 'Aloo Matar Keema Gravy, Fresh Tandoori Rotis, Salad',
      dinnerMenu: 'Daal Masoor, Boiled Rice, Pickles / Achar, Salad',
      notes: 'Nutrient-rich weekend dinner with seasonal fruits distribution',
    },
    {
      dayOfWeek: 'SUNDAY',
      breakfastMenu: 'Special Puri Chana, Suji Ka Halwa, Sweet Lassi / Milk Tea',
      lunchMenu: 'Chicken White Karahi, Nan / Roti, Mint Raita, Fresh Bananas / Apples',
      dinnerMenu: 'Mixed Daal with Desi Ghee Tarka, Chapati, Fresh Green Salad',
      notes: 'Holiday special breakfast and fruit distribution after sports activities',
    },
  ];

  for (const m of weeklyMenu) {
    await prisma.dailyMenu.upsert({
      where: { dayOfWeek: m.dayOfWeek },
      update: m,
      create: m,
    });
  }

  console.log(`✅ Seeded 7-day Institutional Daily Meal Menus (Breakfast, Lunch, Dinner)`);

  // 10. Suppliers
  const suppliersData = [
    { name: 'Al-Madina Grain Merchant Multan', contactPerson: 'Haji Muhammad Asghar', phone: '0300-7355112', email: 'almadina.grains@gmail.com', address: 'Grain Market, Chowk Kumharanwala, Multan', ntn: '1234567-8' },
    { name: 'Multan Flour Mills Ltd.', contactPerson: 'Sheikh Tariq Mahmood', phone: '0301-8644221', email: 'orders@multanflour.com.pk', address: 'Industrial Estate Phase 1, Multan', ntn: '2345678-9' },
    { name: 'Chenab General Store & Ration Suppliers', contactPerson: 'Malik Zafar Iqbal', phone: '0302-9533110', email: 'chenab.ration@yahoo.com', address: 'Hussain Agahi Bazar, Multan', ntn: '3456789-0' },
    { name: 'Shifa Medicos & Surgical Multan', contactPerson: 'Dr. Salman Haider', phone: '0303-6211998', email: 'shifa.medicos.mul@gmail.com', address: 'Nishtar Road, Multan', ntn: '4567890-1' },
  ];

  const supplierList = [];
  for (const sup of suppliersData) {
    const existing = await prisma.supplier.findFirst({ where: { name: sup.name } });
    if (existing) {
      supplierList.push(existing);
    } else {
      const s = await prisma.supplier.create({ data: sup });
      supplierList.push(s);
    }
  }

  // 11. Initial Purchases & Integrated Finance Transactions
  const accountOfficer = createdEmployees.find(e => e.role === Role.ACCOUNT_ASSISTANT);

  const existingPO = await prisma.purchase.findUnique({ where: { purchaseNumber: 'PO-2026-0001' } });
  if (!existingPO && supplierList.length > 0) {
    const p1 = await prisma.purchase.create({
      data: {
        purchaseNumber: 'PO-2026-0001',
        supplierId: supplierList[0].id,
        purchaseDate: new Date('2026-03-01'),
        totalAmount: 145000,
        billNumber: 'BILL-AMG-8821',
        paymentStatus: 'PAID',
        paymentMethod: 'CHEQUE',
        responsiblePersonId: accountOfficer?.id,
        notes: 'Monthly bulk grain & pulses procurement for March 2026',
        items: {
          create: [
            { itemName: 'Super Basmati Rice (Karnal)', quantity: 350, unitPrice: 280, totalPrice: 98000, unit: 'kg' },
            { itemName: 'Daal Chana Special', quantity: 120, unitPrice: 250, totalPrice: 30000, unit: 'kg' },
            { itemName: 'Daal Moong Washed', quantity: 60, unitPrice: 283.33, totalPrice: 17000, unit: 'kg' },
          ],
        },
      },
    });

    // Automatically record finance transaction for purchase
    const rationExpCat = expCatMap['Food & Ration Expenses'];
    if (rationExpCat) {
      await prisma.financeTransaction.create({
        data: {
          type: 'EXPENSE',
          date: new Date('2026-03-01'),
          amount: 145000,
          categoryId: rationExpCat,
          description: 'Cheque Payment for Bulk Ration Purchase (PO-2026-0001) - Al-Madina Grain Merchant',
          responsiblePersonId: accountOfficer?.id,
          referenceNumber: 'CHQ-NBP-449102',
          paymentMethod: 'CHEQUE',
          purchaseId: p1.id,
          notes: 'Duly verified by Account Assistant and approved by Incharge Sweet Home Multan.',
        },
      });
    }
  }

  // 12. Income / Grant Allocation
  const existingGrant = await prisma.financeTransaction.findFirst({ where: { referenceNumber: 'PBM-HQ-GRNT-Q1-2026' } });
  if (!existingGrant) {
    await prisma.financeTransaction.create({
      data: {
        type: 'GRANT',
        date: new Date('2026-01-01'),
        amount: 2500000,
        description: 'Quarterly Welfare Grant Allocation from Head Office (Pakistan Bait-ul-Maal Islamabad)',
        responsiblePersonId: accountOfficer?.id,
        referenceNumber: 'PBM-HQ-GRNT-Q1-2026',
        paymentMethod: 'BANK_TRANSFER',
        notes: 'Funds released for Sweet Home Multan operational expenditures (Food, Education, Utilities, Care).',
      },
    });
  }

  // 13. System Settings
  const settingsData = [
    { key: 'INSTITUTION_NAME', value: 'Pakistan Bait-ul-Maal Sweet Home Multan', group: 'INSTITUTION', description: 'Official name of the welfare facility' },
    { key: 'INSTITUTION_CODE', value: 'PBM-SH-MUL-01', group: 'INSTITUTION', description: 'Government registry code' },
    { key: 'LOCATION_ADDRESS', value: 'Sweet Home Complex, Near Eidgah, LMQ Road, Multan, Punjab, Pakistan', group: 'INSTITUTION', description: 'Physical address' },
    { key: 'TOTAL_BED_CAPACITY', value: '64', group: 'HOSTEL', description: 'Total hostel bed capacity in Block A and Block B' },
    { key: 'DAILY_RATION_PER_CHILD_KG', value: '0.45', group: 'MESS', description: 'Standard caloric ration benchmark' },
    { key: 'EMERGENCY_CONTACT_1', value: '061-9200450 (Sweet Home Control Room)', group: 'SECURITY', description: '24/7 Helpline' },
  ];

  for (const set of settingsData) {
    await prisma.systemSetting.upsert({
      where: { key: set.key },
      update: { value: set.value },
      create: set,
    });
  }

  // 14. Initial Audit Log
  const inchargeUser = await prisma.user.findUnique({ where: { email: 'incharge@sweethome.pbm.gov.pk' } });
  if (inchargeUser) {
    await prisma.auditLog.create({
      data: {
        userId: inchargeUser.id,
        userEmail: inchargeUser.email,
        action: 'SYSTEM_INIT',
        module: 'SETTINGS',
        recordId: 'INIT-001',
        details: 'Initial system configuration and database seeding completed for Sweet Home Multan ERP.',
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
