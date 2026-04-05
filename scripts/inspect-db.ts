import { prisma } from '../lib/db'

async function inspect() {
  console.log('--- 診斷報告 ---')
  
  // 1. 檢查使用者設定
  const users = await prisma.user.findMany()
  console.log('\n使用者名單與設定:')
  users.forEach(u => {
    console.log(`- ${u.name} (ID: ${u.id}, Role: ${u.role})`)
    console.log(`  Settings: ${u.settings}`)
  })

  // 2. 檢查單字資料
  const words = await prisma.word.findMany({
    where: {
      word: { in: ['play', 'test'] }
    }
  })
  console.log('\n單字詳情:')
  words.forEach(w => {
    console.log(`- ${w.word} (ID: ${w.id})`)
    console.log(`  Tags: ${w.tags}`)
    console.log(`  Meaning: ${w.meaning}`)
  })

  // 3. 模擬 API 查詢條件
  const testLevel = 'All' // 假設等級
  const countAll = await prisma.word.count()
  const countWithTags = await prisma.word.count({
      where: {
          tags: { contains: 'All' }
      }
  })
  console.log(`\n統計:`)
  console.log(`- 總單字數: ${countAll}`)
  console.log(`- 帶有 'All' 標籤的單字數: ${countWithTags}`)
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
