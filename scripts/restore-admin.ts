import { prisma } from '../lib/db'

async function restore() {
  try {
    const user = await prisma.user.update({
      where: { email: 'demo@example.com' },
      data: { role: 'Admin' }
    })
    console.log(`✅ Success! User ${user.email} is now an Admin.`)
    console.log(`Current Role: ${user.role}`)
  } catch (err) {
    console.error('Failed to restore admin privileges:', err)
  }
}

restore().then(() => prisma.$disconnect())
