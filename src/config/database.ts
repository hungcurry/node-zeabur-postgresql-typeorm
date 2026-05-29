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

// 明確定義 TypeORM 配置物件的型別，確保 strict 思維
const dbOptions: DataSourceOptions = {
  type: 'postgres',
  // 優先從環境變數讀取，若無則 fallback 到開發期預設值
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'testCurryLee',
  password: process.env.DB_PASSWORD || 'password1234',
  database: process.env.DB_DATABASE || 'typeorm',

  // 【設計取捨說明】
  // synchronize: true 會根據 Entity 自動修改/產出資料表結構。
  // 在開發期（Development）非常方便，但絕對「禁止」在生產環境（Production）開啟，
  // 否則可能導致現有資料遭到覆蓋或刪除。此處透過環境變數動態控管。
  synchronize: process.env.NODE_ENV === 'development',

  // 是否輸出 SQL 日誌，同樣建議透過環境變數控管
  logging: process.env.DB_LOGGING === 'true',

  // 註冊資料庫實體（Entities）
  entities: [OrderSchema, UserSchema],

  // 實務推薦：加入連線池優化設定
  extra: {
    max: 10, // 最大連線數
    connectionTimeoutMillis: 2000, // 連線逾時時間
  },
}

// 建立並導出 DataSource 實例
const AppDataSource = new DataSource(dbOptions)

const connectDB = async (dbName: string = DEFAULT_DB_NAME) => {
  if (!DATABASE_URL) {
    throw new Error('環境變數 DATABASE_URL 未定義')
  }

  // 建立連線池
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('運作順利：PostgreSQL 資料庫連線成功！')
    }

    // 2. 連線成功後，開發環境 建立假資料
    if (process.env.NODE_ENV === 'development') {
      await seedMockData()
    }
  } catch (error) {
    console.error('資料庫連線失敗：', error)
    process.exit(1) // 實務專案中，連線失敗通常需中止服務
  }
}

export { AppDataSource, connectDB }
