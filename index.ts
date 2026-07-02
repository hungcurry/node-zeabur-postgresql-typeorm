import 'dotenv/config' // 確保第一行加載環境變數
import app from './src/app.js'
import { AppDataSource, connectDB } from './src/config/database.js'
import { getConfig } from './src/config/env/index.js'
// seeds資料
import { seedMockData } from './src/seeds/dev/index.js'
import { seedProdData } from './src/seeds/prod/index.js'

const PORT = getConfig<number>('db.port') || 3000

async function initSeedsData() {
  const isDev = process.env.NODE_ENV === 'development'
  const isProd = process.env.NODE_ENV === 'production'
  if (!isDev && !isProd) return

  // 使用 migration再開啟（嚴謹版控流，取代 synchronize: true）
  await AppDataSource.runMigrations()
  // 🥊 組合 A：極速開發（偷懶開掛）
  // synchronize: process.env.NODE_ENV === 'development'
  // 關閉 : await AppDataSource.runMigrations()
  // -------------------------------------
  // 🛡️ 組合 B：嚴謹版控流（防禦大師）
  // 有使用 migration再開啟, 取代 synchronize: true
  // 會自動看 migrations/* 抓有無 遷移檔案 然後建立表單
  // synchronize: false
  // 開啟: await AppDataSource.runMigrations()
  // -------------------------------------

  // 2. 依環境注入不同的 Seed 資料
  if (isDev) {
    await seedMockData()
    // 測試時 想看 prod 資料 請打開
    // await seedProdData()
  }
  if (isProd) {
    await seedProdData()
  }
}

async function startServer() {
  let isDbConnected = false
  try {
    await connectDB()
    console.log('✅ Database service initialized.')
    console.log('🚀 Starting server...')
    isDbConnected = true
  } 
  catch (err: any) {
    // 提取 Message: `...` 內的文字
    const rawMessage = err.message || ''
    const match = rawMessage.match(/Message: `(.*)`/)
    const cleanMsg = match ? match[1] : err.message?.split('\n')[0] || 'Unknown'

    console.error(`❌ 資料庫連線失敗: ${cleanMsg}`)
    console.warn('⚠️ 伺服器將以「降級模式」啟動 (無資料庫連線)。')
  }

  // 連線成功後，建立種子資料
  if (isDbConnected) {
    try {
      await initSeedsData()
    } 
    catch (err: any) {
      console.error('⚠️ [DB-Init] 遷移或種子資料執行失敗，但伺服器仍將嘗試啟動:', err)
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server on http://localhost:${PORT}`)
  })
}

startServer()
