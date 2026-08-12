import { AppDataSource } from '../config/database.js'
import { getConfig } from './env/index.js'

// 要連的資料庫
const DATABASE_NAME = getConfig<string>('db.database')
const DATABASE_URL = getConfig<string>('db.databaseUrl')

const connectDB = async () => {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL 未設定')
  }
  if (!DATABASE_NAME) {
    throw new Error('沒有指定資料庫名稱')
  }

  const parsedUrl = new URL(DATABASE_URL)
  const host = parsedUrl.hostname
  const isLocalMode = host === 'localhost' || host === '127.0.0.1'
  console.log(isLocalMode ? '資料庫模式：本地 Docker MongoDB' : '資料庫模式：雲端 MongoDB')

  // 避免重複 initialize()
  if (AppDataSource.isInitialized) {
    return AppDataSource
  }

  // 建立連線池
  try {
    await AppDataSource.initialize()
    console.log(`運作順利：PostgreSQL 資料庫 [${DATABASE_NAME}] 連線成功！`)

    return AppDataSource
  }
  catch (error) {
    console.error('資料庫連線失敗：', error)
    process.exit(1) // 實務專案中，連線失敗通常需中止服務
  }
}

export { connectDB }
