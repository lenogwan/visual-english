import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const postgresUrl = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL

let prismaInstance: PrismaClient

if (postgresUrl) {
  // Use PostgreSQL if PRISMA_DATABASE_URL is set
  // PrismaClient automatically reads datasourceUrl from env for postgres provider
  prismaInstance = new PrismaClient();
} else {
  // Default to local SQLite for development if no Postgres URL is provided
  // PrismaClient will automatically pick up DATABASE_URL="file:./dev.db"
  prismaInstance = new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? prismaInstance;

// Only attach to globalForPrisma in development to prevent issues in serverless functions
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

