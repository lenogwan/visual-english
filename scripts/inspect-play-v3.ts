import { prisma } from '../lib/db'

async function inspect() {
  try {
    const playWords = await prisma.word.findMany({
      where: {
        OR: [
          { word: 'play' },
          { word: 'Play' }
        ]
      }
    })
    
    console.log('--- Full Database Entry for "Play" ---')
    playWords.forEach((pw) => {
      console.log(JSON.stringify(pw, null, 2))
    })
  } catch (err) {
    console.error('Inspection script V3 error:', err)
  }
}

inspect().then(() => prisma.$disconnect())
