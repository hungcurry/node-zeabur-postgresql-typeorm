import { DataSource } from 'typeorm'
import { getConfig } from './env/index.js'
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
// seeds資料
import { seedMockData } from '../seeds/dev/index.js'
import { seedProdData } from '../seeds/prod/index.js'
// type
import type { DataSourceOptions } from 'typeorm'

// 要連的資料庫
const DATABASE_NAME = getConfig<string>('db.database')
const DATABASE_URL = getConfig<string>('db.databaseUrl')

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
const createDbOptions = (): DataSourceOptions => {
  // throw 錯誤出去交給外層connectDB,去決定執行process.exit(1)
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL 未設定')
  }
  if (!DATABASE_NAME) {
    throw new Error('沒有指定資料庫名稱')
  }

  const parsedUrl = new URL(DATABASE_URL)
  const host = parsedUrl.hostname
  const isLocalMode = host === 'localhost' || host === '127.0.0.1'
  console.log(isLocalMode ? '資料庫模式：本地 Docker PostgreSQL' : '資料庫模式：雲端 PostgreSQL')

  return {
    type: 'postgres',

    // 💡 關鍵商業邏輯：優先檢查有沒有
    // DATABASE_URL 有 localhost
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
    // 🔥 開發環境自動同步（建表），生產環境（false）強制關閉，改走手動 Migration 機制
    // synchronize: process.env.NODE_ENV === 'development',

    // 🔥 （自動同步）強制開啟上傳/生產環境自動同步結構（建表）
    synchronize: false,

    // 是否輸出 SQL 日誌，建議透過環境變數控管
    logging: process.env.DB_LOGGING === 'true',

    // 註冊資料庫實體（Entities）
    entities: [...dbEntities],

    // Migration 檔案位置（供 TypeORM CLI 執行 migration 使用）
    migrations: [
      process.env.NODE_ENV === 'production'
        ? 'dist/migrations/*.js' // 雲端：讀取編譯後的 JS 檔案
        : 'src/migrations/*.{ts,js}', // 本地：讀取開發中的 TS/JS 檔案
    ],

    // 連線池優化設定（正式環境尤為重要）
    extra: {
      max: 10, // 最大連線數
      connectionTimeoutMillis: 2000, // 連線逾時時間
    },
  }
}
// 建立 DataSource。
// ⭐ App 啟動與 TypeORM CLI 共用同一份 DataSource。
// ⭐ TypeORM CLI 執行 migration 時，就是透過這個物件取得資料庫設定。
const AppDataSource = new DataSource(createDbOptions())

const connectDB = async () => {
  // 避免重複 initialize()
  if (AppDataSource.isInitialized) {
    return AppDataSource
  }

  // 建立連線池
  try {
    await AppDataSource.initialize()
    console.log(`運作順利：PostgreSQL 資料庫 [${DATABASE_NAME}] 連線成功！`)

    if (process.env.NODE_ENV === 'development') {
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

      // 使用 migration再開啟
      await AppDataSource.runMigrations()

      // 連線成功後，開發環境 建立假資料
      await seedMockData()
    }

    // production
    if (process.env.NODE_ENV === 'production') {
      // 連線成功後，正式環境 建立種子資料
      await seedProdData()
    }

    return AppDataSource
  } 
  catch (error) {
    console.error('資料庫連線失敗：', error)
    process.exit(1) // 實務專案中，連線失敗通常需中止服務
  }
}

export { AppDataSource, connectDB, dbEntities, keepEntities }
