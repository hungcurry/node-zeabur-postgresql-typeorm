import { DataSource } from 'typeorm'
import { seedMockData } from '../seeds/index.js'
import { getConfig } from './index.js'
// Schema
import { UserSchema } from '../models/UserSchema.js'
import { OrderSchema } from '../models/OrderSchema.js'
// type
import type { DataSourceOptions } from 'typeorm'

const DATABASE_URL = getConfig<string>('db.databaseUrl')
const DEFAULT_DB_NAME: string = 'nuxt3'
// 宣告一個全域未初始化的 DataSource 變數，維持原設計導出
let AppDataSource: DataSource

// *沒有mongoose.connect()那種功能,所以封裝 URL 替換邏輯
const getConnectionString = (dbName: string): string => {
  if (!DATABASE_URL) return ''
  
  try {
    const url = new URL(DATABASE_URL)
    // 動態修改網址路徑為斜線加上資料庫名稱，例如：/nuxt3
    url.pathname = `/${dbName}`
    return url.toString()
  } 
  catch (error) {
    console.error('DATABASE_URL 格式錯誤，無法解析：', error)
    return DATABASE_URL // 若解析失敗，安全降級回原本的 URL
  }
}

// 動態建立 TypeORM 配置物件的函式
const createDbOptions = (dbName: string): DataSourceOptions => {
  // 檢查 DATABASE_URL 是否有值（不是空字串，也不是 undefined/null）
  const isCloudMode = DATABASE_URL !== undefined && DATABASE_URL !== ''

  return {
    type: 'postgres',

    // 💡 關鍵商業邏輯：優先檢查有沒有
    // DATABASE_URL 有字串 => （Zeabur 環境）
    // DATABASE_URL 空值 => （本機docker 環境）
    ...(isCloudMode
      ? { url: getConnectionString(dbName) }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'testCurryLee',
          password: process.env.DB_PASSWORD || 'password1234',
          database: process.env.DB_DATABASE || 'typeorm',
        }),

    // 【設計取捨說明】
    // synchronize: true 會根據 Entity 自動修改/產出資料表結構。
    // 在開發期（Development）非常方便，但絕對「禁止」在生產環境（Production）開啟，
    // 否則可能導致現有資料遭到覆蓋或刪除。此處透過環境變數動態控管。
    // synchronize: process.env.NODE_ENV === 'development',
    synchronize: true, // 僅限開發/測試階段，TypeORM 會自動根據 Schema 建立資料表

    // 是否輸出 SQL 日誌，建議透過環境變數控管
    logging: process.env.DB_LOGGING === 'true',

    // 註冊資料庫實體（Entities）
    entities: [OrderSchema, UserSchema],

    // 連線池優化設定（正式環境尤為重要）
    extra: {
      max: 10, // 最大連線數
      connectionTimeoutMillis: 2000, // 連線逾時時間
    },

    // 🔥 解決 ECONNRESET 阻斷問題
    // ssl: process.env.NODE_ENV === 'production' 
    // ? { rejectUnauthorized: false } 
    // : false,
  }
}

const connectDB = async (dbName: string = DEFAULT_DB_NAME) => {
  // 檢查 DATABASE_URL 是否有值（不是空字串，也不是 undefined/null）
  const isCloudMode = DATABASE_URL !== undefined && DATABASE_URL !== ''
  console.log(isCloudMode ? '資料庫模式：雲端 PostgreSQL' : '資料庫模式：本地 Docker PostgreSQL')

  // 建立連線池
  try {
    const dbOptions = createDbOptions(dbName)
    AppDataSource = new DataSource(dbOptions)

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('運作順利：PostgreSQL 資料庫連線成功！')
    }

    // 2. 連線成功後，開發環境 建立假資料
    if (process.env.NODE_ENV === 'development') {
      await seedMockData()
    }

    return AppDataSource
  } 
  catch (error) {
    console.error('資料庫連線失敗：', error)
    process.exit(1) // 實務專案中，連線失敗通常需中止服務
  }
}

export { AppDataSource, connectDB }
