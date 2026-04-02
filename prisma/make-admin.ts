import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRaw`UPDATE User SET role = 'Admin' WHERE email = 'demo@example.com'`
  console.log('User updated to admin')
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error)
