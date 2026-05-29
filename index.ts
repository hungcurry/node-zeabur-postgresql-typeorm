import 'dotenv/config' // 確保第一行加載環境變數
import app from './src/app.js'
import { connectDB } from './src/config/database.js'

import { getConfig } from './src/config/index.js'
const PORT = getConfig<number>('db.port') || 3000

async function startServer() {
  try {
    await connectDB()
    console.log('✅ Database service initialized.')
  } 
  catch (err: any) {
    // 從 Prisma 囉唆的訊息中只提取 Message: `...` 內的文字
    const rawMessage = err.message || ''
    const match = rawMessage.match(/Message: `(.*)`/)
    const cleanMsg = match ? match[1] : err.message?.split('\n')[0] || 'Unknown'

    console.error(`❌ 資料庫連線失敗: ${cleanMsg}`)
    console.warn('⚠️ 伺服器將以「降級模式」啟動 (無資料庫連線)。')
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server on http://localhost:${PORT}`)
  })
}

startServer()
