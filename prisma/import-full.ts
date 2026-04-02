import { prisma } from '../lib/db'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const baseDir = path.join(__dirname, '..')
  
  const files = [
    'word_lists_detailed1.txt',
    'word_lists_detailed2.txt',
    'word_lists_detailed3.txt',
    'word_lists_detailed4.txt',
    'word_lists_detailed5.txt',
  ]
  
  let totalImported = 0
  let totalSkipped = 0
  let totalLines = 0

  for (const file of files) {
    const dataFile = path.join(baseDir, file)
    
    if (!fs.existsSync(dataFile)) {
      console.log(`File not found: ${file}`)
      continue
    }
    
    const content = fs.readFileSync(dataFile, 'utf-8')
    const lines = content.trim().split('\n')
    
    console.log(`\nProcessing ${file}: ${lines.length} lines`)
    
    let imported = 0
    let skipped = 0

    for (const line of lines) {
      const parts = line.split(', ')
      if (parts.length < 4) {
        skipped++
        continue
      }
      
      const word = parts[0].trim()
      const partOfSpeech = parts[1].trim()
      const category = parts[2].trim()
      const level = parts[3].trim()
      
      const tags = JSON.stringify([partOfSpeech, category, level])
      
      try {
        await prisma.word.upsert({
          where: { word: word },
          update: { tags },
          create: {
            word: word,
            tags,
            phonetic: null,
            images: '[]',
            scenario: null,
            scenarioImages: '[]',
            exampleSentence: null,
            emotionalConnection: null,
          },
        })
        imported++
      } catch (e) {
        skipped++
      }
    }

    console.log(`  Imported: ${imported}, Skipped: ${skipped}`)
    totalImported += imported
    totalSkipped += skipped
    totalLines += lines.length
  }

  const total = await prisma.word.count()
  console.log(`\n=== Import complete! ===`)
  console.log(`Total lines: ${totalLines}`)
  console.log(`Total imported: ${totalImported}`)
  console.log(`Total skipped: ${totalSkipped}`)
  console.log(`Total in database: ${total} words`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
