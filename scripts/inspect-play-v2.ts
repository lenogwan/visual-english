import { prisma } from '../lib/db'

async function inspect() {
  try {
    // Simpler query to avoid SQLite-specific Prisma errors
    const playWords = await prisma.word.findMany({
      where: {
        OR: [
          { word: 'play' },
          { word: 'Play' }
        ]
      }
    })
    
    console.log(`--- Total entries found: ${playWords.length} ---`)
    playWords.forEach((pw, i) => {
      console.log(`Entry ID: ${pw.id} | Sense: ${pw.senseIndex}`)
      console.log(`Images: ${pw.images}`)
      console.log('---')
    })
  } catch (err) {
    console.error('Inspection script V2 error:', err)
  }
}

inspect().then(() => prisma.$disconnect())
