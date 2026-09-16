CREATE TABLE IF NOT EXISTS "ChildComplaint" (
  "id" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reportedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChildComplaint_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChildComplaint_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ChildComplaint_childId_createdAt_idx" ON "ChildComplaint"("childId", "createdAt");
