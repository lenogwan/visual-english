export interface WordData {
  id?: string
  word: string
  partOfSpeech?: string
  senseIndex?: number
  phonetic?: string | null
  meaning?: string | null
  examples?: string[]
  audioUrl?: string
  images: string[]
  scenario?: string | null
  scenarioImages: string[]
  exampleSentence?: string | null
  emotionalConnection?: string | null
  tags: string[]
}

export const sampleWords: WordData[] = [
  {
    word: 'apple',
    phonetic: '/ˈæp.əl/',
    images: [
      'https://images.unsplash.com/photo-1568702846914-96b305d3aa87?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584306354290-cf90e8d23c3c?w=400&h=300&fit=crop',
    ],
    scenario: 'A shiny red fruit hanging from a tree branch, crisp and juicy when bitten',
    scenarioImages: [
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1619546813926-a78fa6378cd7?w=400&h=300&fit=crop',
    ],
    exampleSentence: 'She took a big bite of the crunchy apple.',
    emotionalConnection: 'Remember biting into a fresh apple on a hot summer day - that crisp, refreshing taste!',
    tags: ['noun', 'fruit', 'food'],
  },
  {
    word: 'pretend',
    phonetic: '/prɪˈtend/',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop',
    ],
    scenario: 'A child wearing a superhero cape, running around the living room and making flying sounds',
    scenarioImages: [
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=300&fit=crop',
    ],
    exampleSentence: 'The kids pretended to be pirates sailing the high seas.',
    emotionalConnection: 'Think of that time you acted confident in a meeting while secretly nervous inside!',
    tags: ['verb', 'action', 'imagination'],
  },
  {
    word: 'whisper',
    phonetic: '/ˈwɪs.pər/',
    images: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop',
    ],
    scenario: 'Two friends leaning close together in a quiet library, sharing a secret with barely audible voices',
    scenarioImages: [
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop',
    ],
    exampleSentence: 'She whispered the answer so only he could hear.',
    emotionalConnection: 'Remember sharing secrets with your best friend at a sleepover, giggling in hushed voices?',
    tags: ['verb', 'communication', 'quiet'],
  },
  {
    word: 'thunderstorm',
    phonetic: '/ˈθʌn.dɚ.stɔːrm/',
    images: [
      'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509423355108-b389831e6077?w=400&h=300&fit=crop',
    ],
    scenario: 'Dark clouds rolling across the sky, lightning flashing, followed by a loud boom of thunder and heavy rain pounding the windows',
    scenarioImages: [
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=300&fit=crop',
    ],
    exampleSentence: 'The thunderstorm kept us awake all night with its dramatic light show.',
    emotionalConnection: 'That feeling when lightning strikes and you instinctively count the seconds until the thunder - thrilling yet scary!',
    tags: ['noun', 'weather', 'nature'],
  },
  {
    word: 'sprint',
    phonetic: '/sprɪnt/',
    images: [
      'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop',
    ],
    scenario: 'A runner exploding from the starting blocks, muscles tensed, racing at full speed toward the finish line',
    scenarioImages: [
      'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop',
    ],
    exampleSentence: 'He had to sprint to catch the last bus.',
    emotionalConnection: 'Remember running as fast as you could to catch something - heart pounding, lungs burning, pure adrenaline!',
    tags: ['verb', 'action', 'speed'],
  },
]

export function getWordByIndex(index: number): WordData | undefined {
  return sampleWords[index]
}

export function getRandomWord(): WordData {
  const randomIndex = Math.floor(Math.random() * sampleWords.length)
  return sampleWords[randomIndex]
}
