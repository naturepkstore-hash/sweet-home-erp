# PAKISTAN BAIT-UL-MAAL SWEET HOME MULTAN
## Production Deployment & Operational Manual

This ERP system is built specifically for **Pakistan Bait-ul-Maal (PBM) Sweet Home Multan**. It is a full-stack Next.js (App Router) enterprise system with Prisma ORM, PostgreSQL support, JWT session authentication, Role-Based Access Control (RBAC), and automated cross-module workflows.

---

## 1. Institutional Staffing & Roles

The system adheres strictly to the sanctioned institutional staffing structure:
- **1 Incharge** (`INCHARGE`): Highest administrative authority with full ERP oversight and configuration access.
- **1 Account Assistant** (`ACCOUNT_ASSISTANT`): Full operational ERP control across all modules, ledgers, inventory, and purchases.
- **1 HR Representative** (`HR_REPRESENTATIVE`): Employee management, staff records, and attendance tracking.
- **1 Clerk** (`CLERK`): Student registrations, admissions, classroom allocations, and hostel bed management.
- **9 Mother Maids** (`MOTHER_MAID`): Individual accounts (`mothermaid1` through `mothermaid9`), daily care logs, room attendance, and health checks.
- **2 Waiters** (`WAITER`): Dining hall ration preparation, meal service logs, and pantry hygiene. *(Note: replaces deprecated Warden role).*
- **2 Cooks** (`COOK`): Kitchen meal preparation, recipe batching, and inventory ration consumption.
- **2 Cook Helpers** (`COOK_HELPER`): Kitchen assistant tasks and ingredient preparation.
- **2 Sweepers** (`SWEEPER`): Daily sanitation, room hygiene status logs.
- **2 Security Guards** (`SECURITY_GUARD`): Gate visitor registers, child entry/exit checkouts, night shift logs.

---

## 2. Default Seed Credentials

All accounts are pre-seeded in the database:

| Role | Username | Email | Default Password |
|---|---|---|---|
| **Incharge (Admin)** | `incharge` | `incharge@sweethome.pbm.gov.pk` | `PBM@Admin2026!` |
| **Account Assistant** | `accounts` | `accounts@sweethome.pbm.gov.pk` | `PBM@Accounts2026!` |
| **HR Representative** | `hr` | `hr@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Clerk** | `clerk` | `clerk@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Mother Maid 1** | `mothermaid1` | `mothermaid1@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Mother Maid 2** | `mothermaid2` | `mothermaid2@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Mother Maid 3..9**| `mothermaid3`..`mothermaid9` | `mothermaidX@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Head Cook** | `cook1` | `cook1@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Assistant Cook** | `cook2` | `cook2@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Waiter 1** | `waiter1` | `waiter1@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Waiter 2** | `waiter2` | `waiter2@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Cook Helper 1 & 2**| `cookhelper1`, `cookhelper2` | `cookhelperX@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Sweeper 1 & 2** | `sweeper1`, `sweeper2` | `sweeperX@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |
| **Security Guard 1 & 2**| `guard1`, `guard2` | `guardX@sweethome.pbm.gov.pk` | `PBM@Staff2026!` |

---

## 3. Environment Variables

Create `.env` file in the root directory:

```env
# Database Connection (PostgreSQL for production or SQLite for local dev)
DATABASE_URL="postgresql://username:password@ep-host.region.aws.neon.tech/sweethome_db?sslmode=require"

# JWT Secret for Session Signing
JWT_SECRET="pbm-sweet-home-multan-jwt-secret-key-2026-production"

# Base Application URL
NEXT_PUBLIC_APP_URL="https://sweet-home-erp.vercel.app"
```

---

## 4. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Push schema to database
npm run db:push

# 3. Seed initial institutional data
npm run db:seed

# 4. Start local development server
npm run dev
```

---

## 5. Deployment on Vercel

### Step 1: Provision a PostgreSQL Database
Create a free PostgreSQL instance on **Neon.tech**, **Supabase**, or **Vercel Postgres**.
Copy the Connection String URI (with SSL enabled).

### Step 2: Push Prisma Schema
In your PostgreSQL database, apply the schema:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 3: Deploy to Vercel
1. Import repository into Vercel.
2. In Project Settings > **Environment Variables**, configure:
   - `DATABASE_URL`: Your PostgreSQL URI.
   - `JWT_SECRET`: A secure 64-character string.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL.
3. Set Build Command: `prisma generate && next build` (or leave default `npm run build`).
4. Click **Deploy**.

---

## 6. Key Architecture & Workflows

1. **Automated Inventory & Expense Integration**:
   - Creating an approved Purchase Order immediately increases inventory item stock levels and automatically logs an entry in the Expense Ledger under the respective budget head.
2. **Kitchen Ration Consumption**:
   - Logging daily meal preparation (Breakfast, Lunch, Dinner) calculates ingredient requirements and auto-deducts the corresponding quantities from current inventory stock.
3. **Institutional Audit Trails**:
   - Every administrative, financial, medical, and enrollment action creates an immutable audit record capturing user identity, IP address, action category, timestamp, and metadata diffs.
4. **Offline / Standard Browser Export**:
   - Complete support for Excel (`.xlsx`) and CSV table export with custom institutional headers across Children, Staff, Attendance, Hostel, Inventory, Finances, Expenses, and Audit Logs.
