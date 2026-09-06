# Pakistan Bait-ul-Maal Sweet Home Multan ERP

An institutional Enterprise Resource Planning (ERP) system tailored for **Pakistan Bait-ul-Maal (PBM) Sweet Home Multan**. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL.

---

## Institutional Staffing & Roles

The system is configured with the sanctioned staffing hierarchy of 23 personnel:
- **1 Incharge (`INCHARGE`)**: Highest institutional authority with administrative control, policy settings, and global audit oversight.
- **1 Account Assistant (`ACCOUNT_ASSISTANT`)**: Full operational ERP access across all modules, ledgers, inventory, and purchases.
- **1 HR Representative (`HR_REPRESENTATIVE`)**: Staff management, employee records, and duty rosters.
- **1 Clerk (`CLERK`)**: Child admissions, hostel room beds, and classroom records.
- **9 Mother Maids (`MOTHER_MAID`)**: Individual logins (`mothermaid1`–`mothermaid9`), assigned children logs, and daily health/hygiene check-ins.
- **2 Waiters (`WAITER`)**: Dining hall ration preparation, meal serving logs, and pantry hygiene *(replaces deprecated Warden role)*.
- **2 Cooks (`COOK`)**: Daily meal preparation, recipe batching, and ration inventory deductions.
- **2 Cook Helpers (`COOK_HELPER`)**: Kitchen assistance and ingredient preparation.
- **2 Sweepers (`SWEEPER`)**: Facility zone cleaning and sanitation checklists.
- **2 Security Guards (`SECURITY_GUARD`)**: Gate register, visitor logs, and child checkout logs.

> **Note**: Employee profile records strictly omit the `Joining Date` field in accordance with institutional rules.

---

## Default Seed Accounts

| Role | Username / Email | Default Password | Access Level |
|---|---|---|---|
| **Incharge (Admin)** | `incharge@sweethome.pbm.gov.pk` | `PBM@Admin2026!` | Global Full Access |
| **Account Assistant** | `accounts@sweethome.pbm.gov.pk` | `PBM@Accounts2026!` | Full Operational Access |
| **HR Representative** | `hr@sweethome.pbm.gov.pk` | `PBM@Staff2026!` | Staff & Attendance |
| **Clerk** | `clerk@sweethome.pbm.gov.pk` | `PBM@Staff2026!` | Admissions, Hostel, Education |
| **Mother Maid 1..9** | `mothermaid1`..`9@sweethome.pbm.gov.pk`| `PBM@Staff2026!` | Assigned Children Care & Logs |
| **Cook 1 & 2** | `cook1`, `cook2@sweethome.pbm.gov.pk` | `PBM@Staff2026!` | Kitchen & Ration Consumption |
| **Waiter 1 & 2** | `waiter1`, `waiter2@sweethome.pbm.gov.pk`| `PBM@Staff2026!` | Dining & Meal Serving |
| **Cook Helper 1 & 2** | `cookhelper1`, `2@sweethome.pbm.gov.pk` | `PBM@Staff2026!` | Kitchen Preparation |
| **Sweeper 1 & 2** | `sweeper1`, `2@sweethome.pbm.gov.pk` | `PBM@Staff2026!` | Sanitation Logs |
| **Security Guard 1 & 2**| `guard1`, `2@sweethome.pbm.gov.pk` | `PBM@Staff2026!` | Gate & Visitor Registers |

---

## Local Development Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Push schema to local database
npm run db:push

# 3. Seed initial staff, children, classes, beds, and inventory
npm run db:seed

# 4. Start the development server
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

---

## Vercel Production Deployment Guide

Follow these step-by-step instructions to deploy the system to Vercel with PostgreSQL:

### STEP 1: Create a Production PostgreSQL Database
Create a hosted PostgreSQL database on **Neon.tech**, **Supabase**, or **Vercel Postgres**.
- Copy the **Connection String URL** (with SSL mode enabled: `?sslmode=require`).

### STEP 2: Set DATABASE_URL
In your production database configuration, prepare your connection URI:
```env
DATABASE_URL="postgresql://username:password@ep-host.region.aws.neon.tech/sweet_home_db?sslmode=require"
```

### STEP 3: Set All Required Environment Variables
Review `.env.example` to ensure you have values for all production variables:
- `DATABASE_URL`: Connection string to your PostgreSQL instance.
- `JWT_SECRET`: A secure, high-entropy random string (at least 32 characters).
- `NEXT_PUBLIC_APP_NAME`: `Pakistan Bait-ul-Maal Sweet Home Multan`
- `NEXT_PUBLIC_APP_LOCATION`: `Multan, Punjab, Pakistan`
- `NEXT_PUBLIC_APP_URL`: Your production Vercel URL (e.g. `https://sweet-home-erp.vercel.app`).

### STEP 4: Push the Project to GitHub
Initialize your git repository (if not already done) and push to GitHub:
```bash
git init
git add .
git commit -m "feat: production ready sweet home erp"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sweet-home-erp.git
git push -u origin main
```
*(Verify `.env` is NOT pushed to GitHub; `.gitignore` ensures only `.env.example` is committed).*

### STEP 5: Import the GitHub Repository into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your `sweet-home-erp` repository from GitHub.

### STEP 6: Configure Environment Variables in Vercel
In the Vercel project configuration screen under **Environment Variables**, add:
- `DATABASE_URL` = `postgresql://...`
- `JWT_SECRET` = `your-secret-key-32-chars`
- `NEXT_PUBLIC_APP_NAME` = `Pakistan Bait-ul-Maal Sweet Home Multan`
- `NEXT_PUBLIC_APP_LOCATION` = `Multan, Punjab, Pakistan`
- `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`

### STEP 7: Configure the Production Database
For PostgreSQL in production, update `datasource db.provider` in `prisma/schema.prisma` if needed:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### STEP 8: Run Prisma Migrations / Schema Sync Safely
Before building, initialize your production PostgreSQL database tables:
```bash
# Push schema tables without dropping data
npx prisma db push

# Seed initial institutional staff, beds, classes, and inventory
npx tsx prisma/seed.ts
```

### STEP 9: Deploy
Click **Deploy** in Vercel or trigger a deployment from your git branch.
Vercel will execute:
1. `npm install` (triggers `postinstall: prisma generate`)
2. `npm run build` (`next build` with Turbopack)
3. Instant deployment across global edge network.

### STEP 10: Verify Production Functionality
After deployment completes, open your live URL and verify:
- [x] **Login**: Test sign-in using `incharge@sweethome.pbm.gov.pk` or other staff accounts.
- [x] **Dashboard**: Confirm KPI cards, occupancy meters, and charts load with live data.
- [x] **Database Connection**: Confirm real PostgreSQL read/write persistence.
- [x] **CRUD Operations**: Test creating a Child admission, Staff profile, or Expense voucher.
- [x] **Permissions & RBAC**: Test logging in as Mother Maid (restricted to assigned children only) and Account Assistant (full operational access).
- [x] **Reports & Excel Export**: Download `.xlsx` and `.csv` exports from Children, Inventory, Attendance, or Expenses tables.
- [x] **Automated Stock Interlinking**: Create a Purchase Order and confirm inventory stock increases and expense is recorded in ledger.
- [x] **Audit Logs**: Verify tamper-proof audit events are logged in `/audit`.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Database ORM**: Prisma ORM with SQLite (Local) / PostgreSQL (Production)
- **Authentication**: JWT in HTTP-only secure cookies (`pbm_session`), bcrypt password hashing
- **Exports**: Browser SheetJS (`xlsx`) Excel & CSV export engine
- **Audit**: Immutable server-side activity logging
