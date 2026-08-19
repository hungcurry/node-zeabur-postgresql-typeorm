## PostgreSQL

- **ORM**:
- TypeORM
- Prisma

### Postgres Dockerfile

> 指令

```jsx
// 🚀 啟動資料庫（背景執行）
// docker-compose up -d

// 🚀 停止資料庫（保留資料）
// docker-compose down

// 🚀 重置資料庫（刪volume）
// docker-compose down -v

// 🔄 查看目前運行狀態
// docker-compose ps

// GUI
// ---
// MongoDB =>  MongoDB Compass
// Postgres => DBeaver
```

> Dockerfile

```jsx
// docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres_TypeORM
    restart: always
    environment:
      # 對齊你的 DB_USERNAME
      POSTGRES_USER: testCurryLee
      # 對齊你的 DB_PASSWORD
      POSTGRES_PASSWORD: password1234
      # 對齊你的 DB_DATABASE
      POSTGRES_DB: typeorm
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
    name: postgres_TypeORM
```

> 資料庫的位置

```jsx
// 預設: 5432:5432
ports:
  - '5433:5432'

左邊（5433）：你的本機電腦（Host）對外開放的門牌號碼。
右邊（5432）：Docker 容器內部資料庫自己運作的門牌號碼（PostgreSQL 預設就是 5432，這個不用動）。
```


### ORM 框架-TypeORM

> 指令

```bash
npm install typeorm pg reflect-metadata

# typeorm: 核心 ORM 框架。
# pg: PostgreSQL 的 Node.js 驅動程式
# reflect-metadata: TypeORM 運作必備的裝飾器/元數據支援套件
```

> 架構

```jsx
src/
├─ config
│  ├─ database.ts
├─ entity/models
│  ├─ OrderSchema.ts
│  └─ ProfileSchema.ts
├─ seeds
│  ├─ index.ts
│  └─ orders.seed.ts
│  └─ profiles.seed.ts
├─ app.ts
├─ index.ts
```

> database.ts

```jsx
import { DataSource } from 'typeorm'
import { seedMockData } from '../seeds/index.js'
import { getConfig } from './index.js'
// Schema
import { UserSchema } from '../models/UserSchema.js'
import { ProfileSchema } from '../models/ProfileSchema.js'
import { OrderSchema } from '../models/OrderSchema.js'
// type
import type { DataSourceOptions } from 'typeorm'

const DATABASE_URL = getConfig<string>('db.databaseUrl')
const DEFAULT_DB_NAME: string = 'typeorm'
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
    synchronize: process.env.NODE_ENV === 'development',

    // 🔥 強制開啟手動上傳/生產環境自動同步結構（建表）
    // synchronize: true,

    // 是否輸出 SQL 日誌，建議透過環境變數控管
    logging: process.env.DB_LOGGING === 'true',

    // 註冊資料庫實體（Entities）
    entities: [UserSchema, OrderSchema, ProfileSchema],

    // 連線池優化設定（正式環境尤為重要）
    extra: {
      max: 10, // 最大連線數
      connectionTimeoutMillis: 2000, // 連線逾時時間
    },
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
```

> src/models/OrderSchema.ts

```jsx
import { EntitySchema } from 'typeorm'
import type { TProfile } from './ProfileSchema.js'

// 定義 Order 結構的 TypeScript 介面
export type TOrder = {
  id: number
  user_id: number
  amount: number
  // TS才需要
  // 核心：必須明確定義這個關聯屬性，TypeORM 才能在 relations 中找到它
  profile?: TProfile
}

export const OrderSchema = new EntitySchema<TOrder>({
  name: 'Order', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'orders', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      primary: true, // 主鍵 (每筆資料唯一)
      type: 'integer', // 整數型別
      nullable: false, // 不可為空值
    },
    user_id: {
      type: 'integer',
      nullable: false,
    },
    amount: {
      type: 'integer',
      nullable: false,
    },
  },
  relations: {
    // profile: 虛擬要連結用的欄位:
    profile: {
      target: 'Profile', // 要連到哪個 Entity : Profile Entity
      type: 'many-to-one', // 關聯型態：多對一 (多個 Order 對應到一個 User)
      //
      // joinColumn 每個屬性是誰寫誰
      // | 屬性                      | 是誰的欄位              寫在哪個表 | 作用   |
      // | ------------------------ | ------------- | ----- | --------------- |
      // | name                     | 自己表           | orders    | 建立 `user_id` 欄位 |
      // | referencedColumnName     | 對方表           | profiles  | 指向 `id` 欄位      |
      // | foreignKeyConstraintName | constraint 名稱 | orders    | 外鍵名稱            |
      //
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'user_id', // 本表對應的欄位名稱 (Order 表的 user_id)
        referencedColumnName: 'id', // 對方表 (User) 的主鍵欄位名稱
        foreignKeyConstraintName: 'order_user_id_fk' // 外鍵約束名稱
      },
    },
  },
})
```

> 常用屬性

```jsx
常用20屬性: {
  type: 'varchar',        // 欄位資料型別 (字串/integer/uuid/boolean/date 等)
  type: 'integer',        // 整數型別
  length: 50,             // 字串最大長度 (varchar / char)
  nullable: false,        // 不可以為空值
  unique: true,           // 唯一性約束：不能出現兩筆一樣的值
                          // user1@gmail.com
                          // user1@gmail.com   ❌ 重複
  default: 'guest',       // 預設值
  primary: true,          // 主鍵 (每筆資料唯一)
  type: 'uuid',           // UUID 型別
  generated: 'uuid',      // 自動生成值 (uuid / increment)
  comment: '使用者名稱',   // 欄位註解 (DB comment)

  select: false,          // 查詢時預設不回傳 (常用於 password)
  update: false,          // 更新時忽略此欄位
  insert: false,          // 新增時忽略此欄位
  precision: 10,          // 數字總位數 (decimal)
  scale: 2,               // 小數位數 (decimal)
}
createdAt: {
  type: 'timestamp',  // 時間戳記
  createDate: true,   // 新增時自動寫入時間
  updateDate: true,   // 更新時自動更新時間
  deleteDate: true,   // soft delete 時寫入時間
}
// DB 用 snake_case => created_at
// JS 用 camelCase => createdAt
// 2者用法不同,所以特別重取
createdAt: {
  type: 'timestamp',
  name: 'created_at', // 指定「資料庫裡」的欄位名稱。
}
```

> src/index.ts

```jsx
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
```

> src/seeds/orders.seed.ts

```jsx
import type { TOrder } from '../models/OrderSchema.js'

export const mockOrders: TOrder[] = [
  { id: 101, user_id: 1, amount: 500 },
  { id: 102, user_id: 2, amount: 300 },
]
```

> src/seeds/index.ts 使用檔案

```jsx
// import { DataSource } from 'typeorm'
import { AppDataSource } from '../config/database.js'
// Schema
import { ProfileSchema } from '../models/ProfileSchema.js'
import { OrderSchema } from '../models/OrderSchema.js'
// mock 假資料
import { mockProfiles } from './profiles.seed.js'
import { mockOrders } from './orders.seed.js'

export async function seedMockData() {
  try {
    // getRepository 是繼承自 TypeORM DataSource 類別的原生方法
    const profileRepository = AppDataSource.getRepository(ProfileSchema)
    const orderRepository = AppDataSource.getRepository(OrderSchema)

    // 1. 寫入 Profiles (因爲有外鍵約束，Profile 必須先寫入)
    await profileRepository.save(mockProfiles)
    console.log('✅ Profiles 假資料寫入成功！')

    // 2. 寫入 Orders
    await orderRepository.save(mockOrders)
    console.log('✅ Orders 假資料寫入成功！')

    // 3. 驗證結果並印出( 實際JOIN Profile 資料 )
    const newOrders = await orderRepository.find({
      relations: {
        profile: true, // 對應 : profile: 虛擬要連結用的欄位
      } as any,
    })

    console.log('\n--- 最終產出的 Orders 帶有關聯資料 ---')
    console.log(JSON.stringify(newOrders, null, 2))
  }
  catch (error) {
    console.error('⚠️ Seeder 執行失敗:', error)
  }
}
```


### ORM 框架-Prisma

> 指令

```bash
npm install prisma @prisma/client
npx prisma init
```

> 架構

```jsx
src/
prisma / schema.prisma
├─ app.js
├─ crud.js
├─ prisma.config.js
```

> prisma/schema.prisma

```jsx
// prisma/schema.prisma
// 定義 Prisma Client 的生成方式
// 官方設計就是單一入口,所以不再拆分檔案 prisma/schema.prisma
// 等同於 Mongoose models/user.model.ts
// ------------
generator client {
  provider = "prisma-client-js"
}
// 定義資料庫連線設定
datasource db {
  // 指定資料庫類型為 PostgreSQL
  provider = "postgresql"
}
model Skill {
  // UUID 字串 ID
  // @default(dbgenerated("gen_random_uuid()"))（資料庫端生成）
  // @default(uuid())（Prisma 程式端生成）
  // -------
  id         String     @id @default(uuid()) @db.Uuid
  name       String     @unique @db.VarChar(50)
  createdAt  DateTime   @default(now()) @map("created_at")

  @@map("skills") // 對應資料庫表名
}
// 解說屬性
// ------
// model Skill {
//   id 欄位
//   @id: 標記為主鍵 (Primary Key)
//   @default(uuid()): 預設值由 Prisma 自動產生 UUID
//   @db.Uuid: 指定資料庫底層使用 UUID 資料型別 (適用於 PostgreSQL)
//   ~id        String   @id @default(uuid()) @db.Uuid

//   name 欄位
//   @unique: 設定唯一約束，不允許重複的技能名稱
//   @db.VarChar(50): 指定資料庫底層為字串型別，且最大長度為 50
//   ~name      String   @unique @db.VarChar(50)

//   createdAt 欄位
//   DateTime: 在 TS 中會被對應為 Date 物件
//   @default(now()): 新增資料時，若未傳入值，自動取系統當下時間
//   @map("created_at"): 將程式碼中的「createdAt」對應到資料庫內實際的「created_at」欄位名
//   ~createdAt DateTime @default(now()) @map("created_at")

//   @@map("skills"): 將此 Model 對應到資料庫中名為 skills 的資料表 (預設會是小寫 skills)
// }
```

> prisma.config

```jsx
// 這是 Prisma 6/7 推出的 Programmatic Configuration。
// prisma.config
import 'dotenv/config' // 確保在此配置初始化前讀取 .env
import { defineConfig, env } from '@prisma/config' // Prisma 6+ 提供的配置工具

/**
 * 這是 Prisma 6/7 推出的 Programmatic Configuration (程式化配置)
 * 它允許你用 TypeScript 來定義原本寫在 schema.prisma 裡的 datasource 設定
 */
export default defineConfig({
  datasource: {
    /**
     * 使用 env() 輔助函式讀取環境變數
     * 相比於直接用 process.env.DATABASE_URL，
     * Prisma 的 env() 提供了更好的型別檢查與預設值機制。
     */
    url: env('DATABASE_URL'),
  },
})
```

> src/app.js

```jsx
// src/app.js
import { PrismaClient } from '@prisma/client'
// 在開發環境中，為了防止 HMR 導致連線數過多，通常會掛載在 global
const prisma = new PrismaClient()

export default prisma
```

> src/crud.js 使用檔案

```jsx
// CRUD 範例 (src/crud.js)
import prisma from './db.js'

async function runCRUD() {
  try {
    // ✅ Create
    const skill = await prisma.skill.create({
      data: { name: 'NodeJS' },
    })
    console.log('Created:', skill)

    // ✅ Read all
    const allSkills = await prisma.skill.findMany()
    console.log('All Skills:', allSkills)

    // ✅ Read one
    const oneSkill = await prisma.skill.findUnique({
      where: { id: skill.id },
    })
    console.log('One Skill:', oneSkill)

    // ✅ Update
    const updatedSkill = await prisma.skill.update({
      where: { id: skill.id },
      data: { name: 'TypeScript' },
    })
    console.log('Updated Skill:', updatedSkill)

    // ✅ Delete
    await prisma.skill.delete({ where: { id: skill.id } })
    const afterDelete = await prisma.skill.findMany()
    console.log('After Delete:', afterDelete)
  } catch (error) {
    console.error('❌ CRUD operation failed:', error)
  } finally {
    // 執行完畢中斷連線
    await prisma.$disconnect()
  }
}

runCRUD()
```


### 4套 JOIN 差異寫法

#### (一).原理
---

```jsx
MongoDB:
// [query] → $lookup → 直接合併

PostgreSQL:
// [query] → JOIN → 直接合併

ORM 2種:
// schema(定義關係)
//         ↓
// query(include/relations)
//         ↓
// SQL JOIN 才發生
```


#### (二).MongoDB lookup 寫法
---

```jsx
// orders集合
[
  { order_id: 1, product: 'Laptop', cust_id: 101 },
  { order_id: 2, product: 'Phone', cust_id: 102 },
],
// customers集合
[
  { customer_id: 101, name: 'Alice' }, 
  { customer_id: 102, name: 'Bob' },
]

db.orders.aggregate([
  {
    $lookup: {
      // 1. 當前主表欄位：目前這張表（通常是 Customers）要拿來對照的「鑰匙」
      localField: 'cust_id',
      // 2. 外部表：你想要抓哪一張表的資料過來合併？
      from: 'customers',
      // 3. 外部表欄位：目標對象（orders 表）裡面，哪一個欄位跟那把「鑰匙」是對得上的？
      foreignField: 'customer_id',
      // 4. 輸出的新欄位名稱：合併進來後，要在當前物件裡建立什麼名字來放「陣列」結果？
      as: 'customer_info',
    },
  },
])
[
  // 結果=>
  ({
    order_id: 1,
    product: 'Laptop',
    cust_id: 101,
    customer_info: [{ customer_id: 101, name: 'Alice' }],
  },
  {
    order_id: 2,
    product: 'Phone',
    cust_id: 102,
    customer_info: [{ customer_id: 102, name: 'Bob' }],
  })
]
```


#### (三).PostgreSQL JOIN 寫法
---

```jsx
// PostgreSQL 會把 未加引號的名稱全部轉小寫
// SELECT * FROM Orders
// 變 => SELECT * FROM orders
// 因此通常建議：
// * 表名使用複數
// * 欄位使用 snake_case
// * 全部小寫
// * 避免使用 PostgreSQL 保留字
// * 誰有 Foreign Key，誰就是子表（Child）: orders / products
//--------------------------------
1. orders 表（自己表-子表）
---
| id (PK) | user_id (FK) | amount |
| ------- | ------------ | ------ |
| 101     | 1            | 500    |
| 102     | 2            | 300    |


2. users 表（對方表-父表）
---
| id (PK) | name |
| ------- | ---- |
| 1       | Tom  |
| 2       | Mary |


3. 結果
---
| order_id | amount | name |
| -------- | ------ | ---- |
| 101      | 500    | Tom  |
| 102      | 300    | Mary |


// -- 外來鍵 foreign / 參考 references
// -- 設定外來鍵關聯
// FOREIGN KEY (user_id) REFERENCES users(id)
// --------------------------------------
// 原本原生寫法
// FOREIGN KEY (user_id)
// REFERENCES users(id)
// CONSTRAINT orders_user_id_fk (通常會省略這行...)

-- 建立 orders 表（自己表）
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,

    // -- 外來鍵關聯
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    // 通常會省略這行...
    -- CONSTRAINT orders_user_id_fk
);

-- 建立 users 表（對方表）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
)

// SELECT * FROM "orders"
SELECT
    orders.id AS order_id,
    orders.amount,
    users.name
FROM orders
INNER JOIN users
    ON orders.user_id = users.id;

| order_id | amount | name |
| -------- | ------ | ---- |
| 101      | 500    | Tom  |
| 102      | 300    | Mary |

```


#### (四).TypeORM JOIN 寫法
---

> 原理定義

```jsx
*TypeORM

// 定義關聯 Entity：
relations: {
  // profile: 虛擬要連結用的欄位:
  profile: {
    target: 'Profile', // 要連到哪個 Entity : Profile Entity
    type: 'many-to-one', // 關聯型態：多對一 (多個 Order 對應到一個 profile)
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'orders_user_id_fk',
    },
  }
}

// 查詢合併 JOIN：
// import { DataSource } from 'typeorm'
import { AppDataSource } from '../config/database.js'
import { OrderSchema } from '../models/OrderSchema.js'

// getRepository 是繼承自 TypeORM DataSource 類別的原生方法
const orderRepository = AppDataSource.getRepository(OrderSchema)
// 3. 驗證結果並印出( 實際JOIN Profile 資料 )
const newOrders= await orderRepository.find({
  relations: {
    profile: true, // 對應 : profile: 虛擬要連結用的欄位
  } as any,
})
```

> 定義關聯 Entity

```jsx
Entity (Entity 名稱)
單數 + PascalCase
---
// name: 'User'
// name: 'Order'
// name: 'Product'

tableNam (對應資料表名稱)
複數 + snake_case + 小寫
---
// tableName: 'users'
// tableName: 'orders'
// tableName: 'order_items


// orders表
name: 'Order', // Entity 名稱
tableName: 'orders', // 對應資料表名稱
columns: {
  id: {
    primary: true, // 主鍵 (每筆資料唯一)
    type: 'integer', // 整數型別
    nullable: false // 不可為空值
  },
  user_id: {
    type: 'integer',
    nullable: false
  },
  amount: {
    type: 'integer',
    nullable: false
  },
},
relations: {
  // profile: 虛擬要連結用的欄位:
  profile: {
    target: 'Profile', // 要連到哪個 Entity : Profile Entity
    type: 'many-to-one', // 關聯型態：多對一 (多個 Order 對應到一個 User)
    //
    // joinColumn 每個屬性是誰寫誰
    // | 屬性                      | 是誰的欄位              寫在哪個表 | 作用   |
    // | ------------------------ | ------------- | ----- | --------------- |
    // | name                     | 自己表           | orders    | 建立 `user_id` 欄位 |
    // | referencedColumnName     | 對方表           | profiles  | 指向 `id` 欄位      |
    // | foreignKeyConstraintName | constraint 名稱 | orders    | 外鍵名稱            |
    //
    joinColumn: {
      // 設定 Join 的資料庫欄位
      name: 'user_id', // 本表對應的欄位名稱 (Order 表的 user_id)
      referencedColumnName: 'id', // 對方表 (User) 的主鍵欄位名稱
      foreignKeyConstraintName: 'order_user_id_fk' // 外鍵約束名稱
    },
  },
},


// profiles表
name: 'Profile', // Entity 名稱 ( 單數 + PascalCase )
tableName: 'profiles', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
columns: {
  id: {
    type: 'integer',
    primary: true,
    nullable: false,
  },
  name: {
    type: 'varchar',
    length: 50,
    nullable: false,
  },
},
```

> 檔案內使用

```jsx
// src/seeds/index.ts

// import { DataSource } from 'typeorm'
import { AppDataSource } from '../config/database.js'
// Schema
import { ProfileSchema } from '../models/ProfileSchema.js'
import { OrderSchema } from '../models/OrderSchema.js'
// mock 假資料
import { mockProfiles } from './profiles.seed.js'
import { mockOrders } from './orders.seed.js'

export async function seedMockData() {
  try {
    // getRepository 是繼承自 TypeORM DataSource 類別的原生方法
    const profileRepository = AppDataSource.getRepository(ProfileSchema)
    const orderRepository = AppDataSource.getRepository(OrderSchema)

    // 1. 寫入 Profiles (因爲有外鍵約束，Profile 必須先寫入)
    await profileRepository.save(mockProfiles)
    console.log('✅ Profiles 假資料寫入成功！')

    // 2. 寫入 Orders
    await orderRepository.save(mockOrders)
    console.log('✅ Orders 假資料寫入成功！')

    // 3. 驗證結果並印出( 實際JOIN Profile 資料 )
    const newOrders = await orderRepository.find({
      relations: {
        profile: true, // 對應 : profile: 虛擬要連結用的欄位
      } as any,
    })

    console.log('\n--- 最終產出的 Orders 帶有關聯資料 ---')
    console.log(JSON.stringify(newOrders, null, 2))
  }
  catch (error) {
    console.error('⚠️ Seeder 執行失敗:', error)
  }
}
```

> 執行結果

```jsx
orders: [
  {
    id: 101,
    user_id: 1,
    amount: 500,
  },
  {
    id: 102,
    user_id: 2,
    amount: 300,
  },
]
profiles: [
  {
    id: 1,
    name: 'Tom',
  },
  {
    id: 2,
    name: 'Mary',
  },
]

// 結果=>
--- 最終產出的 Orders 帶有關聯資料 ---
[
  {
    "id": 101,
    "user_id": 1,
    "amount": 500,
    "profile": {
      "id": 1,
      "name": "Tom"
    }
  },
  {
    "id": 102,
    "user_id": 2,
    "amount": 300,
    "profile": {
      "id": 2,
      "name": "Mary"
    }
  }
]
```


#### (五).Prisma JOIN 寫法
---

> 原理定義

```jsx
*Prisma

// 定義關聯 Schema
// profile Profile @relation(...)
profile Profile @relation(...)

// 查詢合併 JOIN：
// 檔案內使用
import prisma from './db.js';
const newOrders = await prisma.order.findMany({
  include: {
    profile: true // 對應： profile Profile 這個 relation 欄位名稱。
  }
})
```

> 定義關聯 Entity

```jsx
// prisma/schema.prisma
// ❗ schema.prisma = 定義關係（不會查資料）
// ❗ findMany = 真正執行 JOIN

model Order {
  id      Int @id @default(autoincrement())
  // 外來鍵欄位
  user_id Int
  amount  Int

  // profile Profile @relation(...)
  // 有一個虛擬欄位叫 profile，它連到 Profile model
  // -------
  // 👉 profile Profile = 寫法意思
  //            profile	這個欄位叫 profile
  //            Profile	裡面放 Profile 資料
  // Order 有一個虛擬欄位叫 profile，它連到 Profile model
  // -------
  // 👉 @relation = 告訴 Prisma 怎麼連
  // fields: [user_id], // 自己的表 外來鍵
  // references: [id], // 對方表 主鍵欄位
  // map: "order_user_id_fk" // 外鍵約束名稱（可選，對應資料庫裡的外鍵約束名稱）
  profile Profile @relation(fields: [user_id], references: [id], map: "order_user_id_fk")

  @@map("orders") // 對應資料表名稱 (複數 + snake_case + 小寫)
}

model Profile {
  id    Int     @id @default(autoincrement())
  name  String  @db.VarChar(50)
  
  // 🔥 一對多關係一定要補這個
  // 👉 代表一個 Profile 可以擁有多個 Order
  orders Order[]

  @@map("profiles") // 對應資料表名稱 (複數 + snake_case + 小寫)
}
```

> 檔案內使用

```jsx
// src/crud.js 使用檔案
import prisma from './db.js'

async function runCRUD() {
  try {
    // ✅ Read all - 這裡才會 JOIN
    // prisma.orders 對應 =>  model Order
    const newOrders = await prisma.order.findMany({
      include: {
        user: true, // 對應： user User 這個 relation 欄位名稱。
      },
    })
    console.log('newOrders', newOrders)
  } catch (error) {
    console.error('❌ failed:', error)
  }
}
runCRUD()
```

> 執行結果

```jsx
orders: [
  {
    id: 101,
    user_id: 1,
    amount: 500,
  },
  {
    id: 102,
    user_id: 2,
    amount: 300,
  },
]
profiles: [
  {
    id: 1,
    name: 'Tom',
  },
  {
    id: 2,
    name: 'Mary',
  },
]

// 結果=>
--- 最終產出的 Orders 帶有關聯資料 ---
[
  {
    "id": 101,
    "user_id": 1,
    "amount": 500,
    "profile": {
      "id": 1,
      "name": "Tom"
    }
  },
  {
    "id": 102,
    "user_id": 2,
    "amount": 300,
    "profile": {
      "id": 2,
      "name": "Mary"
    }
  }
]
```
