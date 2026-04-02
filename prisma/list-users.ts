import { prisma } from '../lib/db'

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } })
  console.log('All users:')
  users.forEach(u => console.log(`- ${u.email} (${u.name}) - role: ${u.role}`))
}

main().then(() => prisma.$disconnect())
