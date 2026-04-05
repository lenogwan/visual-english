import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isProduction = process.env.NODE_ENV === 'production'
const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

let prismaInstance: PrismaClient

if (isProduction && tursoUrl && tursoToken) {
  // Production: Use Turso via adapter
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  })
  const adapter = new PrismaLibSQL(libsql)
  prismaInstance = new PrismaClient({ adapter })
} else {
  // Development: Use standard local SQLite (default Prisma behavior)
  prismaInstance = new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? prismaInstance

if (!isProduction) globalForPrisma.prisma = prisma
