import { prisma } from '../lib/db'

async function check() {
  try {
    const users = await prisma.user.findMany()
    console.log('--- DATABASE USERS ---')
    if (users.length === 0) {
      console.log('❌ No users found in database!')
    } else {
      users.forEach(u => {
        console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name}`)
      })
    }
  } catch (err) {
    console.error('Check script error:', err)
  }
}

check().then(() => prisma.$disconnect())
