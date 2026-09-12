import { Role } from '@prisma/client';

export interface DefaultStaffUser {
  id: string;
  email: string;
  username: string;
  passwordPlainText: string;
  role: Role;
  fullName: string;
  department: string;
  employeeId: string;
  designation: string;
}

export const DEFAULT_STAFF_USERS: DefaultStaffUser[] = [
  {
    id: 'usr-incharge-01',
    email: 'incharge@sweethome.pbm.gov.pk',
    username: 'incharge',
    passwordPlainText: 'PBM@Admin2026!',
    role: Role.INCHARGE,
    fullName: 'Muhammad Usman Khan',
    department: 'Administration',
    employeeId: 'emp-incharge-01',
    designation: 'Incharge / Project Director',
  },
  {
    id: 'usr-accounts-01',
    email: 'accounts@sweethome.pbm.gov.pk',
    username: 'accounts',
    passwordPlainText: 'PBM@Accounts2026!',
    role: Role.ACCOUNT_ASSISTANT,
    fullName: 'Tariq Mahmood',
    department: 'Accounts & Finance',
    employeeId: 'emp-accounts-01',
    designation: 'Account Assistant',
  },
  {
    id: 'usr-hr-01',
    email: 'hr@sweethome.pbm.gov.pk',
    username: 'hr',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.HR_REPRESENTATIVE,
    fullName: 'Farhan Ali',
    department: 'Human Resources',
    employeeId: 'emp-hr-01',
    designation: 'HR Representative',
  },
  {
    id: 'usr-clerk-01',
    email: 'clerk@sweethome.pbm.gov.pk',
    username: 'clerk',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.CLERK,
    fullName: 'Rashid Minhas',
    department: 'Administration',
    employeeId: 'emp-clerk-01',
    designation: 'Records Clerk',
  },
  {
    id: 'usr-mothermaid-01',
    email: 'mothermaid1@sweethome.pbm.gov.pk',
    username: 'mothermaid1',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.MOTHER_MAID,
    fullName: 'Nasreen Bibi',
    department: 'Child Care & Hostel',
    employeeId: 'emp-mothermaid-01',
    designation: 'Mother Maid 1',
  },
  {
    id: 'usr-mothermaid-02',
    email: 'mothermaid2@sweethome.pbm.gov.pk',
    username: 'mothermaid2',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.MOTHER_MAID,
    fullName: 'Parveen Akhtar',
    department: 'Child Care & Hostel',
    employeeId: 'emp-mothermaid-02',
    designation: 'Mother Maid 2',
  },
  {
    id: 'usr-cook-01',
    email: 'cook1@sweethome.pbm.gov.pk',
    username: 'cook1',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.COOK,
    fullName: 'Muhammad Ramzan',
    department: 'Mess & Kitchen',
    employeeId: 'emp-cook-01',
    designation: 'Head Cook 1',
  },
  {
    id: 'usr-cook-02',
    email: 'cook2@sweethome.pbm.gov.pk',
    username: 'cook2',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.COOK,
    fullName: 'Muhammad Aslam',
    department: 'Mess & Kitchen',
    employeeId: 'emp-cook-02',
    designation: 'Assistant Cook 2',
  },
  {
    id: 'usr-cookhelper-01',
    email: 'cookhelper1@sweethome.pbm.gov.pk',
    username: 'cookhelper1',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.COOK_HELPER,
    fullName: 'Bilal Ahmed',
    department: 'Mess & Kitchen',
    employeeId: 'emp-cookhelper-01',
    designation: 'Cook Helper 1',
  },
  {
    id: 'usr-cookhelper-02',
    email: 'cookhelper2@sweethome.pbm.gov.pk',
    username: 'cookhelper2',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.COOK_HELPER,
    fullName: 'Zubair Hassan',
    department: 'Mess & Kitchen',
    employeeId: 'emp-cookhelper-02',
    designation: 'Cook Helper 2',
  },
  {
    id: 'usr-waiter-01',
    email: 'waiter1@sweethome.pbm.gov.pk',
    username: 'waiter1',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.WAITER,
    fullName: 'Shahid Imran',
    department: 'Mess & Kitchen',
    employeeId: 'emp-waiter-01',
    designation: 'Waiter 1',
  },
  {
    id: 'usr-waiter-02',
    email: 'waiter2@sweethome.pbm.gov.pk',
    username: 'waiter2',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.WAITER,
    fullName: 'Kamran Khan',
    department: 'Mess & Kitchen',
    employeeId: 'emp-waiter-02',
    designation: 'Waiter 2',
  },
  {
    id: 'usr-sweeper-01',
    email: 'sweeper1@sweethome.pbm.gov.pk',
    username: 'sweeper1',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.SWEEPER,
    fullName: 'Babu Masih',
    department: 'Sanitation',
    employeeId: 'emp-sweeper-01',
    designation: 'Sanitation Staff 1',
  },
  {
    id: 'usr-sweeper-02',
    email: 'sweeper2@sweethome.pbm.gov.pk',
    username: 'sweeper2',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.SWEEPER,
    fullName: 'Yousaf Masih',
    department: 'Sanitation',
    employeeId: 'emp-sweeper-02',
    designation: 'Sanitation Staff 2',
  },
  {
    id: 'usr-guard-01',
    email: 'security1@sweethome.pbm.gov.pk',
    username: 'security1',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.SECURITY_GUARD,
    fullName: 'Muhammad Akhtar',
    department: 'Security & Safety',
    employeeId: 'emp-guard-01',
    designation: 'Security Guard 1',
  },
  {
    id: 'usr-guard-02',
    email: 'security2@sweethome.pbm.gov.pk',
    username: 'security2',
    passwordPlainText: 'PBM@Staff2026!',
    role: Role.SECURITY_GUARD,
    fullName: 'Ghulam Abbas',
    department: 'Security & Safety',
    employeeId: 'emp-guard-02',
    designation: 'Security Guard 2',
  },
];

export function findDefaultStaffUser(loginId: string): DefaultStaffUser | undefined {
  const clean = loginId.trim().toLowerCase();
  return DEFAULT_STAFF_USERS.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      u.username.toLowerCase() === clean ||
      // Also allow guard1 alias for security1
      (clean === 'guard1' && u.username === 'security1') ||
      (clean === 'guard1@sweethome.pbm.gov.pk' && u.email === 'security1@sweethome.pbm.gov.pk') ||
      (clean === 'guard2' && u.username === 'security2') ||
      (clean === 'guard2@sweethome.pbm.gov.pk' && u.email === 'security2@sweethome.pbm.gov.pk')
  );
}
