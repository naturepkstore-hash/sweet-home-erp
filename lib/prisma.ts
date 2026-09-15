import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL?.trim()
  || process.env.POSTGRES_PRISMA_URL?.trim()
  || process.env.POSTGRES_URL?.trim();

if (databaseUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

if (!databaseUrl && process.env.NODE_ENV !== 'production') {
  process.env.DATABASE_URL = 'file:./dev.db';
}

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error('DATABASE_URL is required. Set it in the deployment environment before starting the application.');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
