import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const password = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password,
      name: 'Demo User',
      role: 'Admin',
    },
  })

  const words = [
    { word: 'apple', phonetic: '/ˈæp.əl/', scenario: 'A shiny red fruit hanging from a tree branch', exampleSentence: 'She took a big bite of the crunchy apple.', tags: '["noun", "fruit", "food"]', images: '[]', scenarioImages: '[]' },
    { word: 'pretend', phonetic: '/prɪˈtend/', scenario: 'A child wearing a superhero cape, running around', exampleSentence: 'The kids pretended to be pirates sailing the high seas.', tags: '["verb", "action", "imagination"]', images: '[]', scenarioImages: '[]' },
    { word: 'whisper', phonetic: '/ˈwɪs.pər/', scenario: 'Two friends leaning close together sharing a secret', exampleSentence: 'She whispered the answer so only he could hear.', tags: '["verb", "communication", "quiet"]', images: '[]', scenarioImages: '[]' },
    { word: 'thunderstorm', phonetic: '/ˈθʌn.dɚ.stɔːrm/', scenario: 'Dark clouds rolling across the sky, lightning flashing', exampleSentence: 'The thunderstorm kept us awake all night.', tags: '["noun", "weather", "nature"]', images: '[]', scenarioImages: '[]' },
    { word: 'sprint', phonetic: '/sprɪnt/', scenario: 'A runner exploding from the starting blocks at full speed', exampleSentence: 'He had to sprint to catch the last bus.', tags: '["verb", "action", "speed"]', images: '[]', scenarioImages: '[]' },
    { word: 'happy', phonetic: '/ˈhæp.i/', scenario: 'A person smiling with bright eyes and arms raised in joy', exampleSentence: 'She felt happy when she received the good news.', tags: '["adjective", "emotion"]', images: '[]', scenarioImages: '[]' },
    { word: 'run', phonetic: '/rʌn/', scenario: 'A person moving quickly with legs pumping', exampleSentence: 'I run every morning to stay healthy.', tags: '["verb", "action", "movement"]', images: '[]', scenarioImages: '[]' },
    { word: 'beautiful', phonetic: '/ˈbjuː.tɪ.fəl/', scenario: 'A sunset over mountains with vibrant colors', exampleSentence: 'The view from the top was beautiful.', tags: '["adjective", "appearance"]', images: '[]', scenarioImages: '[]' },
    { word: 'eat', phonetic: '/iːt/', scenario: 'A person holding a fork and bringing food to mouth', exampleSentence: 'We eat three meals a day.', tags: '["verb", "action"]', images: '[]', scenarioImages: '[]' },
    { word: 'book', phonetic: '/bʊk/', scenario: 'A person reading a thick novel in a cozy chair', exampleSentence: 'I love to read a good book before bed.', tags: '["noun", "object", "reading"]', images: '[]', scenarioImages: '[]' },
    { word: 'water', phonetic: '/ˈwɔː.tər/', scenario: 'A clear glass of water with ice cubes', exampleSentence: 'Please drink more water throughout the day.', tags: '["noun", "liquid", "nature"]', images: '[]', scenarioImages: '[]' },
    { word: 'house', phonetic: '/haʊs/', scenario: 'A cozy suburban home with a white fence and green lawn', exampleSentence: 'My grandparents live in a big house.', tags: '["noun", "building", "home"]', images: '[]', scenarioImages: '[]' },
    { word: 'walk', phonetic: '/wɔːk/', scenario: 'A person strolling through a park on a sunny day', exampleSentence: 'Let us walk to the store instead of driving.', tags: '["verb", "action", "movement"]', images: '[]', scenarioImages: '[]' },
    { word: 'think', phonetic: '/θɪŋk/', scenario: 'A person with hand on chin, deep in thought', exampleSentence: 'I need to think about this before deciding.', tags: '["verb", "mental"]', images: '[]', scenarioImages: '[]' },
    { word: 'learn', phonetic: '/lɜːrn/', scenario: 'A student taking notes in a classroom', exampleSentence: 'It is important to learn new skills.', tags: '["verb", "education"]', images: '[]', scenarioImages: '[]' },
  ]

  for (const w of words) {
    const existingWord = await prisma.word.findFirst({
      where: { word: w.word, senseIndex: 0 }
    })

    if (existingWord) {
      await prisma.word.update({
        where: { id: existingWord.id },
        data: w
      })
    } else {
      await prisma.word.create({
        data: {
          ...w,
          senseIndex: 0
        }
      })
    }
  }

  console.log('Database seeded successfully!')
  console.log(`Created user: ${user.email}`)
  console.log(`Seeded ${words.length} words`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
