CREATE TABLE IF NOT EXISTS "SalaryStructure" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "basicSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SalaryStructure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "PayrollEntry" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "payrollMonth" TEXT NOT NULL,
  "basicSalary" DOUBLE PRECISION NOT NULL,
  "allowances" DOUBLE PRECISION NOT NULL,
  "deductions" DOUBLE PRECISION NOT NULL,
  "leaveDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netSalary" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "paidAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayrollEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayrollEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PayrollEntry_employeeId_payrollMonth_key" ON "PayrollEntry"("employeeId", "payrollMonth");
CREATE INDEX IF NOT EXISTS "SalaryStructure_employeeId_active_idx" ON "SalaryStructure"("employeeId", "active");
CREATE INDEX IF NOT EXISTS "PayrollEntry_payrollMonth_status_idx" ON "PayrollEntry"("payrollMonth", "status");
