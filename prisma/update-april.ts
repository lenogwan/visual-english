import { prisma } from '../lib/db'

async function main() {
  const existingWord = await prisma.word.findFirst({
    where: { word: 'April' }
  })

  if (!existingWord) {
    console.log('Word "April" not found')
    return
  }

  const word = await prisma.word.update({
    where: { id: existingWord.id },
    data: {
      phonetic: '/ˈeɪ.prəl/',
      scenario: 'The fourth month of the year, springtime, often associated with showers and flowers',
      exampleSentence: 'April is the month when flowers start to bloom.',
      emotionalConnection: 'Remember those spring days when you went outside and felt the warm sun after winter?',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop'
      ]),
      scenarioImages: JSON.stringify([
        'https://images.unsplash.com/photo-1516937941344-00b4ec7330f5?w=400&h=300&fit=crop'
      ]),
      tags: JSON.stringify(['noun', 'General', 'A1'])
    }
  })
  console.log('Updated:', word.word)
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error)
