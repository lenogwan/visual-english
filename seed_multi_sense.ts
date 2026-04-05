import { prisma } from './lib/db'

async function main() {
  console.log('Seeding multi-sense words...')

  const words = [
    {
      word: 'fast',
      partOfSpeech: 'adj',
      senseIndex: 0,
      meaning: 'Moving or capable of moving at high speed.',
      phonetic: '/fæst/',
      tags: JSON.stringify(['adj', 'General', 'A1']),
      exampleSentence: 'He is a fast runner.',
      emotionalConnection: 'Imagine a cheetah sprinting across the savanna.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=1000']),
    },
    {
      word: 'fast',
      partOfSpeech: 'verb',
      senseIndex: 1,
      meaning: 'Abstain from all or some kinds of food or drink, especially as a religious observance.',
      phonetic: '/fæst/',
      tags: JSON.stringify(['verb', 'Religion', 'B1']),
      exampleSentence: 'They fast during Ramadan.',
      emotionalConnection: 'A sense of discipline and spiritual focus amidst hunger.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=1000']),
    },
    {
       word: 'play',
       partOfSpeech: 'verb',
       senseIndex: 0,
       meaning: 'Engage in activity for enjoyment and recreation rather than a serious or practical purpose.',
       phonetic: '/pleɪ/',
       tags: JSON.stringify(['verb', 'General', 'A1']),
       images: JSON.stringify(['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000']),
    },
    {
        word: 'play',
        partOfSpeech: 'noun',
        senseIndex: 1,
        meaning: 'A dramatic work for the stage or to be broadcast.',
        phonetic: '/pleɪ/',
        tags: JSON.stringify(['noun', 'Arts', 'B1']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=1000']),
    }
  ]

  for (const w of words) {
    await prisma.word.create({ data: w })
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
