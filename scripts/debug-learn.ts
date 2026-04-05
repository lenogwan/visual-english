import { prisma } from '../lib/db'

async function debug() {
  try {
    const users = await prisma.user.findMany()
    console.log('--- USERS ---')
    users.forEach(u => {
      console.log(`User: ${u.name} | Settings: ${u.settings}`)
    })

    const words = await prisma.word.findMany()
    console.log('\n--- WORDS ---')
    words.forEach(w => {
      console.log(`Word: ${w.word} | Tags: ${w.tags}`)
    })
  } catch (err) {
    console.error('Debug script error:', err)
  }
}

debug().then(() => prisma.$disconnect())
