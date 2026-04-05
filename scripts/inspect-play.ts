import { prisma } from '../lib/db'

async function inspect() {
  try {
    const playWords = await prisma.word.findMany({
      where: {
        word: {
          contains: 'play'
        }
      }
    })
    
    console.log('--- Word "Play" Inspection ---')
    playWords.forEach((pw, i) => {
      console.log(`Index ${i}:`)
      console.log(`- ID: ${pw.id}`)
      console.log(`- SenseIndex: ${pw.senseIndex}`)
      console.log(`- Images: ${pw.images}`)
      console.log(`- ScenarioImages: ${pw.scenarioImages}`)
      console.log('---')
    })
  } catch (err) {
    console.error('Inspection script error:', err)
  }
}

inspect().then(() => prisma.$disconnect())
