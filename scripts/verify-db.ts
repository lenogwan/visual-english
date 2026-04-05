import { prisma } from '../lib/db'

async function main() {
  console.log('正在準備寫入資料至 SQLite...')
  
  const wordsToVerify = ['play', 'test']
  
  for (const word of wordsToVerify) {
    // 使用 upsert 避免重複寫入導致錯誤，並確保我們可以重複執行此驗證
    const result = await prisma.word.upsert({
      where: { id: `verify-${word}` },
      update: {
        updatedAt: new Date(),
      },
      create: {
        id: `verify-${word}`,
        word: word,
        partOfSpeech: 'verb',
        meaning: 'System verification word',
      },
    })
    console.log(`✅ 成功處理單字: ${result.word} (ID: ${result.id})`)
  }

  // 查詢全部 Word 資料表中的數量
  const count = await prisma.word.count()
  console.log(`\n目前 Word 資料表總數: ${count}`)
}

main()
  .catch((e) => {
    console.error('❌ 發生錯誤:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
