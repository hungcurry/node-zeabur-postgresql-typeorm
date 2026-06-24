import { DataSource } from 'typeorm'
import { seedMockData } from '../seeds/index.js'
import { getConfig } from './index.js'
import { getConnectionString } from '../utils/db-utils.js'
// Schema
// === 無關連表 ===
import { UserSchema } from '../models/UserSchema.js'
// === 父表 (主表) ===
import { ProfileSchema } from '../models/ProfileSchema.js'
import { CategorySchema } from '../models/CategorySchema.js'
// === 子表 (從表) ===
import { OrderSchema } from '../models/OrderSchema.js'
import { ProductSchema } from '../models/ProductSchema.js'
// type
import type { DataSourceOptions } from 'typeorm'

// 要連的資料庫
const DATABASE_NAME = getConfig<string>('db.database')
const DATABASE_URL = getConfig<string>('db.databaseUrl')
let AppDataSource: DataSource

// *所有Entity 註冊清單（AppDataSource 使用）
const dbEntities = [
  UserSchema,
  // === 父表 (主表) ===
  ProfileSchema,
  CategorySchema,
  // === 子表 (從表) ===
  OrderSchema,
  ProductSchema,
]
// *Seeder 清空時的保留資料 Entity 清單
const keepEntities = new Set([
  // 用 new Set() 意義
  // xxx.has(e) 快速查找（hash）不用掃描整個陣列
  CategorySchema,
  ProductSchema,
])

// 動態建立 TypeORM 配置物件的函式
const createDbOptions = (isLocalMode: boolean): DataSourceOptions => {
  return {
    type: 'postgres',

    // 💡 關鍵商業邏輯：優先檢查有沒有
    // DATABASE_URL 有localhost
    ...(isLocalMode
      ? {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'testCurryLee',
          password: process.env.DB_PASSWORD || 'password1234',
          database: process.env.DB_DATABASE || 'typeorm',
        }
      : {
          url: getConnectionString(DATABASE_URL, DATABASE_NAME),
        }),

    // 【設計取捨說明】
    // synchronize: true 會根據 Entity 自動修改/產出資料表結構。
    // 在開發期（Development）非常方便，但絕對「禁止」在生產環境（Production）開啟，
    // 否則可能導致現有資料遭到覆蓋或刪除。此處透過環境變數動態控管。
    synchronize: process.env.NODE_ENV === 'development',

    // 🔥 強制開啟手動上傳/生產環境自動同步結構（建表）
    // synchronize: true,

    // 是否輸出 SQL 日誌，建議透過環境變數控管
    logging: process.env.DB_LOGGING === 'true',

    // 註冊資料庫實體（Entities）
    entities: [...dbEntities],

    // 連線池優化設定（正式環境尤為重要）
    extra: {
      max: 10, // 最大連線數
      connectionTimeoutMillis: 2000, // 連線逾時時間
    },
  }
}
const connectDB = async () => {
  // 攔截 AppDataSource 避免重複建立
  if (AppDataSource) return AppDataSource
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL 未設定')
    process.exit(1)
  }
  if (!DATABASE_NAME) {
    console.error('❌ 沒有指定資料庫名稱')
    process.exit(1)
  }

  const parsedUrl = new URL(DATABASE_URL)
  const host = parsedUrl.hostname
  const isLocalMode = host === 'localhost' || host === '127.0.0.1'
  console.log(isLocalMode ? '資料庫模式：本地 Docker PostgreSQL' : '資料庫模式：雲端 PostgreSQL')

  // 建立連線池
  try {
    const dbOptions = createDbOptions(isLocalMode)
    AppDataSource = new DataSource(dbOptions)

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log(`運作順利：PostgreSQL 資料庫 [${DATABASE_NAME}] 連線成功！`)
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

export { AppDataSource, connectDB, dbEntities, keepEntities }
