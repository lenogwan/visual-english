import { prisma } from '../lib/db'
import { hash } from 'bcryptjs'

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@visual-english.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  
  console.log(`--- Initializing Admin User ---`)
  console.log(`Target Email: ${email}`)
  console.log(`Database Mode: ${process.env.NODE_ENV === 'production' ? 'TURSO (Production)' : 'SQLite (Local)'}`)

  const hashedPassword = await hash(password, 10)

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'Admin',
        password: hashedPassword
      },
      create: {
        email,
        name: 'Super Admin',
        password: hashedPassword,
        role: 'Admin'
      }
    })

    console.log(`Success: Admin user "${user.email}" has been initialized/promoted.`)
  } catch (error) {
    console.error('Initialization error:', error)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error)
