import { prisma } from '../lib/db'

async function fix() {
  console.log('--- 正在執行資料庫優化與修復 ---')

  // 1. 清除所有現有的 Word，確保我們從乾淨的狀態開始（針對 play 和 test）
  await prisma.word.deleteMany({
    where: { word: { in: ['play', 'test'] } }
  })
  console.log('✅ 已清除舊的 play, test 單字資料')

  // 2. 獲取第一個使用者（Demo User）
  const user = await prisma.user.findFirst()
  if (user) {
    // 清除該使用者的所有進度，確保不會被 excludeLearned 過濾
    await prisma.userProgress.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ 已清除使用者 ${user.name} 的所有學習進度`)
  }

  // 3. 重新建立單字，並填入完整的 JSON 格式與 'All' 標籤
  const wordsToCreate = [
    { word: 'play', meaning: 'to engage in activity for enjoyment', tags: ['All', 'General'] },
    { word: 'test', meaning: 'a procedure intended to establish quality', tags: ['All', 'General'] }
  ]

  for (const item of wordsToCreate) {
    await prisma.word.create({
      data: {
        word: item.word,
        meaning: item.meaning,
        partOfSpeech: 'verb',
        tags: JSON.stringify(item.tags),
        images: '[]',
        scenarioImages: '[]',
        examples: '[]'
      }
    })
    console.log(`✅ 已重新建立單字: ${item.word}`)
  }

  console.log('\n--- 驗證 API 邏輯 ---')
  const count = await prisma.word.count({
    where: {
      OR: [
        { tags: { contains: 'All' } },
        { tags: '[]' }
      ]
    }
  })
  console.log(`預期 API (Level: All) 將回傳 ${count} 個單字。`)
}

fix().then(() => prisma.$disconnect())
