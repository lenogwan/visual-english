import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting data migration: tags[2] -> level column...')
  
  const words = await prisma.word.findMany()
  console.log(`Found ${words.length} words to process.`)

  let updatedCount = 0
  let skippedCount = 0

  for (const word of words) {
    try {
      const tags = JSON.parse(word.tags || '[]')
      const levelFromTag = tags[2] // Traditionally where level was stored

      if (levelFromTag && typeof levelFromTag === 'string') {
        const cleanTags = [...tags]
        // Optionally remove the level from tags index 2
        // cleanTags.splice(2, 1); 
        // Actually, let's just make sure level is correct
        
        await prisma.word.update({
          where: { id: word.id },
          data: {
            level: levelFromTag,
            tags: JSON.stringify(cleanTags)
          }
        })
        updatedCount++
      } else {
        skippedCount++
      }
    } catch (e) {
      console.error(`Failed to migrate word: ${word.word}`, e)
    }
  }

  console.log(`✅ Migration complete!`)
  console.log(`Updated: ${updatedCount}`)
  console.log(`Skipped: ${skippedCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
