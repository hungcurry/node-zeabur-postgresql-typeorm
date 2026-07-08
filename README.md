## 專案快速啟動

#### node-zeabur-postgresql-typeorm

> 指令

```jsx
// 🚀 指令
// ---
// PostgreSQL Connect Command
// 給「人」在終端機輸入
psql "postgresql://root:RDU560JAVsZE92m17Pg4nSlN3zMXbQK8@43.163.206.9:32050"

// ~Zeabur選這個填
// Connection String
// 適合環境變數使用
postgresql://root:RDU560JAVsZE92m17Pg4nSlN3zMXbQK8@43.163.206.9:32050

// 如果要指定資料庫 +上
// XXXXX?authSource=admin
/nuxt3


// 🚀 啟動資料庫
// ---
// ~GUI
// MongoDB =>  MongoDB Compass
// Postgres => DBeaver

// 啟動資料庫（背景執行）
docker-compose up -d

// 停止資料庫（保留資料）
docker-compose down

// 重置資料庫（刪volume）
docker-compose down -v

// 查看目前運行狀態
docker-compose ps


// 🚀 8080 指令
// ---
// 查看 8080 port
netstat -ano | findstr :8080

// 清除 占用 8080 的程序
npm run clean:port
"scripts": {
  "clean:port": "npx kill-port 8080"
}
```

> 網址

```jsx
// 🚀 雲端 Zeabur API網址
// ---
使用雲端資料庫: user / role

// 測試 商業邏輯(初始化 只執行一次)
**使用index.html 測試**
http://127.0.0.1:5500/public/index.html

https://node-zeabur-postgresql-typeorm.zeabur.app/users

// 測試 系統邏輯(資料不會變)
**使用index.html 測試**
http://127.0.0.1:5500/public/role.html

https://node-zeabur-postgresql-typeorm.zeabur.app/roles

**swagger**
https://node-zeabur-postgresql-typeorm.zeabur.app/api-docs


// 🚀 本機 使用postman 測試
// ---
使用本地資料庫: todo / product

// PORT=8080
http://localhost:8080/todos

// 測試前端送資料過去 zod驗證
**使用products.html 測試**
http://127.0.0.1:5500/public/products.html

http://localhost:8080/products
```

> 時間格式

```jsx
// ==============================
// Timestamp  ( UTC+0 )
// ==============================
Date.now()
// 型別
number
// 範例
1781245804387（13 位數）毫秒

// 說明
// 自 1970-01-01T00:00:00.000Z (Unix Epoch)
// 起算經過的毫秒數

// ==============================
// Date Object
// ==============================
new Date()
// 型別
Date (object)
// 範例
Fri Jun 12 2026 14:33:53 GMT+0800 (台北標準時間)

// 說明
// JavaScript 原生日期物件
// 可進行日期計算、格式轉換等操作

// ==============================
// ISO 8601 ( UTC+0 )
// ==============================
new Date().toISOString()
// 型別
string
// 範例
"2026-06-12T06:32:21.085Z"

// 說明
// 國際標準日期時間格式
// Z = UTC 時區
// 常用於 API、JSON、資料庫儲存與傳輸
```

> 資料庫的位置

```jsx
// 預設: 5432:5432
ports:
  - '5434:5432'

左邊（5432）：你的本機電腦（Host）對外開放的門牌號碼。
右邊（5432）：Docker 容器內部資料庫自己運作的門牌號碼（PostgreSQL 預設就是 5432，這個不用動）。
```


#### 專案架構

```jsx
node-zeabur-postgresql-typeorm/
├── src/
│   ├── config/
│   │   └── database.ts.ts      # 初始化與連線管理
│   ├── controllers/
│   │   └── userController.ts   # 處理請求、呼叫 Service 並回傳回應
│   ├── middlewares/
│   │   └── authHandle.ts       # toke驗證
│   ├── models/entity
│   │   └── UserSchema.ts       # 定義與資料庫對應的 TS 型別
│   │
│   ├── services/               # (選填) 建議加入，專門放 Prisma 的查詢邏輯
│   │   └── userService.ts
│   ├── routes/
│   │   └── userRoutes.ts       # 路由定義
│   ├── seeds/
│   │   └── orders.seed.ts      # 假資料
│   ├── type/
│   │   └── index.ts            # 型別
│   ├── utils/
│   │   └── generateJWT.ts      # 工具函式
│   │
│   └── app.ts                  # Express Middleware 與路由掛載
├── .env                        # 包含 DATABASE_URL
├── index.ts                    # 入口檔案 (啟動伺服器)
├── package.json                # 需加入 @prisma/client, typescript, ts-node 等
└── tsconfig.json               # 建議使用 NodeNext 或 ESNext 模組規範
```


#### 指令安裝

```jsx
// TypeORM 專案依賴安裝指令
# 安裝 生產環境 (dependencies)
npm install express cors dotenv cross-env bcryptjs jsonwebtoken pg reflect-metadata swagger-jsdoc swagger-ui-express typeorm pino pino-http pino-roll

# 安裝 開發環境 (devDependencies)
npm install -D typescript tsx nodemon tsc-alias pino-pretty @types/node @types/express @types/cors @types/pg @types/bcryptjs @types/jsonwebtoken @types/swagger-jsdoc @types/swagger-ui-express
```


```jsx
"scripts": {
  "dev": "cross-env NODE_ENV=development && nodemon --exec tsx index.ts",
  "build": "tsc && tsc-alias -p tsconfig.json",
  "start": "cross-env NODE_ENV=production && node dist/index.js",
  "clean:port": "npx kill-port 8080"
},
```


#### TS @路徑問題

```jsx
// 前端有Vite幫我們做到 @路徑解析
// 後端Express要多裝套件 使用修改@

1️⃣ 安裝 tsc-alias
npm install -D tsc-alias

2️⃣ tsconfig.json 設置 alias
  "compilerOptions": {
    // 轉@路徑別名設定
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    /* 檔案配置 */
    "rootDir": "./",      // 包含根目錄的 index.ts 與 src 資料夾
    "outDir": "./dist",   // 編譯後的 JS 檔案輸出的目錄
  },

3️⃣ build script
  "scripts": {
    "build": "tsc && tsc-alias -p tsconfig.json",
  },
```


```jsx
// ~為啥這專案的路徑 都要寫.js
// 現代 Node.js 後端（你的情況）
特徵：不使用 Vite/Webpack 打包，直接用 tsx 或 node 執行。
規範：必須寫 .js 副檔名。
原因：為了符合 Node.js 官方的 ESM 規範（NodeNext）。

// 前端框架（Vue 3 / React）
特徵：使用 Vite 或 Webpack。
規範：通常不寫副檔名，或者寫 .ts（由打包工具處理）。
原因：Vite 這種工具會在背後幫你補全路徑，所以你可以寫得很漂亮。
```


#### Zeabur開PostgreSQL資料表 注意事項

> 重新產生 Prisma Client

```jsx
// 修改完 本地 schema.prisma 後，請務必在專案終端機執行：
npx prisma generate
```

> 雲端建立方法1-UI 介面手動填寫

```jsx
// 遞增數字
id屬性 型別：int
database.default (預設值)：留空
database.constraint (約束)：GENERATED ALWAYS AS IDENTITY

// UUID
id屬性 型別：text
database.default (預設值)：  gen_random_uuid()
database.constraint (約束)： PRIMARY KEY
```

![資料表建立錯誤](./src/images/database-ui.png)

> 雲端建立方法2-用SQL語法建立

```SQL
// users
-- 1. 先把原本那張被網頁 UI 搞壞的表徹底刪除
DROP TABLE IF EXISTS users;

-- 2. 用最純正的 PostgreSQL 語法，直接建立帶有自動遞增與主鍵的表
CREATE TABLE users (
    -- id SERIAL PRIMARY KEY,
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), --型別是 UUID
    name TEXT NOT NULL,
    age INT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
);
```


#### TypeOrm 注意事項

* 新建立 Schema

```jsx
// models/ 新建立 XyyyyySchema.ts
// ----
需要去 database.ts / createDbOptions 設定新增

import { ProductSchema } from '../models/ProductSchema.js'
entities: [ UserSchema, OrderSchema, ProfileSchema, ProductSchema ],
```


* 單向/雙向關聯
> 單向關聯

```jsx
Order (many-to-one) Profile
✅ 只寫 many-to-one
✅ 不需要 inverseSide
```

```jsx
OrderSchema (子表):
relations: {
  profile: {
    target: 'Profile',
    type: 'many-to-one',
    joinColumn: { name: 'profile_id' }
    // ❌ 不需要寫 inverseSide
  }
}
```

```jsx
ProfileSchema (父表):
// ❌ 保持乾淨，完全不需要寫 relations
relations: {}
```

```jsx
--- 最終產出的 Orders 帶有關聯資料 ---
[
  {
    "id": 1,
    "amount": 500,
    "createdAt": 1781501690637,
    "updatedAt": 1781501690637,
    "profile_id": 101,
    "profile": {
      "id": 101,
      "name": "Tom"
    }
  },
  {
    "id": 2,
    "amount": 300,
    "createdAt": 1781501690637,
    "updatedAt": 1781501690637,
    "profile_id": 102,
    "profile": {
      "id": 102,
      "name": "Mary"
    }
  }
]
```


> 雙向關聯

```jsx
Order (many-to-one) Profile
Profile (one-to-many) Orders

✅ 兩邊都定義 relation
✅ inverseSide 互相指向對方 property 名稱
```

```jsx
OrderSchema (子表):
relations: {
  profile: {
    target: 'Profile',
    type: 'many-to-one',
    joinColumn: { name: 'profile_id' },
    inverseSide: 'orders' // 👈 告訴 TypeORM，對方那邊叫 'orders'
  }
}
```

```jsx
ProfileSchema (父表):
relations: {
  orders: { // 👈 對方看過來時，我這裡叫 'orders'
    target: 'Order',
    // (反向映射)
    // 組裝資料時，預設就一定會把它轉成 陣列 []
    type: 'one-to-many',
    inverseSide: 'profile' // 👈 告訴 TypeORM，對方那邊叫 'profile'
  }
}
```

```jsx
--- 反向映射 Profiles ---
[
  {
    "id": 101,
    "name": "Tom",
    "orders": [
      {
        "id": 1,
        "amount": 500,
        "createdAt": 1781501690637,
        "updatedAt": 1781501690637,
        "profile_id": 101
      }
    ]
  },
  {
    "id": 102,
    "name": "Mary",
    "orders": [
      {
        "id": 2,
        "amount": 300,
        "createdAt": 1781501690637,
        "updatedAt": 1781501690637,
        "profile_id": 102
      }
    ]
  }
]
```


#### Migration 

> 指令

```jsx
// TypeORM 的 Migration
npm install typeorm pg
npm install -D typescript tsx @types/node @types/pg

// 希望維持原本簡短的 --name=AddEmailToUser，
// 那最好的跨平台方案就是藉由 cross-var 
// 這個 npm 套件來抹平作業系統的差異
npm install --save-dev cross-var
// npm run migration:generate --name=AddEmailToUser
```


```jsx
"scripts": {
  "dev": "cross-env NODE_ENV=development nodemon --exec tsx index.ts",
  "build": "tsc && tsc-alias -p tsconfig.json",
  // 雲端部屬 會先跑 prestart + start
  "prestart": "cross-env NODE_ENV=production npm run migration:run",
  "start": "cross-env NODE_ENV=production node dist/index.js",
  "clean:port": "npx kill-port 8080",
  // migration 指令
  "typeorm": "tsx ./node_modules/typeorm/cli.js -d ./src/config/database.ts",
  "migration:generate": "cross-var npm run typeorm -- migration:generate src/migrations/$npm_config_name",
  "migration:run": "npm run typeorm -- migration:run",
  "migration:revert": "npm run typeorm -- migration:revert",
  "migration:show": "npm run typeorm -- migration:show"
},
🟢 開發時（你在本機改 schema）
// migration:generate 👉 建立 Migration 檔，不套用到資料庫
// migration:run 👉 建立並套用 Migration（開發環境）
// migration:show 👉 看資料庫目前 migration 狀態
// migration:revert 👉 回滾上一個 migration（本機除錯用）
🔵 部署時（雲端 / production）
// migration:run 👉 把「推上來的 未執行的 migration」全部套用
```


> 開發流（Workflow）

1. 本地開發開發
```jsx
本地開發：直接改 Entity，因為
synchronize 是 true，
// synchronize: process.env.NODE_ENV === 'development',
本機資料庫自動隨你變更。
```


2. 初始化Migration
```jsx
確保設定檔中 synchronize: false
```


3. 清空資料庫
```jsx
清空並「立刻重啟」資料庫（關鍵順序）
我們要讓資料庫變成全空，但必須是開著的

先 ctrl +c 關閉專案

// 徹底砍掉舊資料庫與數據卷
docker compose down -v
// 立刻啟動一個「全新、全空」的資料庫
docker compose up -d
```


4. 初始化 對著「空資料庫」拍快照
```jsx
1. 建立藍圖
npm run migration:generate --name=InitProject
// TypeORM 連進去剛剛啟動的 Docker，發現裡面什麼表都沒有（因為剛才重啟清空了），
// 對比你的 Entity 程式碼，就會把所有建表語法打包，
// 成功在 src/migrations/ 資料夾下產生 InitProject 檔案

2. 打開 ./src/migrations/ 下
剛生成的 xxxx-自訂名稱.ts 檔案
// up：升級資料庫結構（正式環境會跑這個）
// down：還原資料庫結構（跑 migration:revert 時會跑這個）

3. node執行序,會報錯誤 產生檔案 加上 type
import type { MigrationInterface, QueryRunner } from "typeorm"

4. 將藍圖 實際建立到資料庫
// 檢查欄位 有沒建立好
npm run migration:run
```


5. 檢查與大功告成
```jsx
database.ts 程式碼中的  
打開 await AppDataSource.runMigrations() 
就會把剛剛拍好的快照倒進去這個空資料庫，
之後伺服器重新啟動 都會更新資料夾
// 等同於 npm run migration:run
// 之後重新整理 就跑段這個就好
// 自動~將藍圖寫入資料庫

// 重新啟動 假資料灌入
npm run dev 
```


6. Zeabur雲端
```jsx
推送上雲：git push 到 GitHub。
Zeabur 接手： 雲端執行：Zeabur 執行新設定的 start 指令
先幫你跑了 migration:run（比對簽到表，只更新新欄位），接著網站順利啟動！
{
  "scripts": {
    // 👇 prestart / start 指令
    "prestart": "cross-env NODE_ENV=production npm run migration:run",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "migration:run": "npm run typeorm -- migration:run",
  }
}
```


7. 之後重複版控
```jsx
修改 UserSchema.ts 增加欄位（例如新增 email）

// 1. 開始使用migration
synchronize: false

// 2. 建立藍圖
npm run migration:generate --name=AddEmailToUser
// npm run migration:generate --name=SystemMetaSchema

// 3.node執行序,會報錯誤 產生檔案 加上 type
import type { MigrationInterface, QueryRunner } from "typeorm"

// 4. 實際施工資料庫(更新本地資料庫)
// * 如果 database.ts 有設定 await AppDataSource.runMigrations()
// 這行之後 就不需要自己手動一直打
npm run migration:run

// 5.推送雲端專案
"prestart": "cross-env NODE_ENV=production npm run migration:run",
"start": "cross-env NODE_ENV=production node dist/index.js",


// 6. 反悔 剛剛新增email欄位
🟢 方法一: 重新打 一個 migration
// 類似用commit 去取消 上一個commit
// 把 UserSchema.ts email 欄位刪除
1. 刪除掉 UserSchema.ts 的 email 欄位
2. npm run migration:generate --name=RemoveEmailToUser
3. npm run migration:run

🟢 (推薦)方法二: 刪除掉 migrations/AddEmailToUser
// 不想一直跑migration 讓檔案一直增加 
1. ctrl + c 停用伺服器
2. 刪除掉 UserSchema.ts 的 email 欄位
3. 先確認目前狀態
   npm run migration:show

4. 回滾上一次執行的 migration
   呈現 [ ] AddEmailToUser（已完成）
   代表 沒執行過,這時候去看 確認資料庫是否回滾更新了
   資料庫會有一張表 migrations
   npm run migration:revert
   
5. 刪除掉本機 /src/migrations/AddEmailToUser*.ts
6. 啟動專案：執行 npm run dev
```


8. 流程圖
```jsx
      ┌────────────────────────┐
      │  修改 Entity (Schema)   │
      └───────────┬────────────┘
                  │
                  ▼
      ┌────────────────────────┐
      │ npm run migration:gen  │ ◄── (手動畫出施工藍圖 .ts)
      └───────────┬────────────┘
                  │
                  ▼
  ====================================
  【 階段一：本地開發環境 (Development) 】
  ====================================
                  │
                  ▼
      ┌────────────────────────┐
      │   npm run dev 啟動專案  │
      └───────────┬────────────┘
                  │
                  ▼
      ┌────────────────────────┐
      │ AppDataSource.runMigrations() 
      │  (本地開機：自動讀藍圖施工)  │
      └───────────┬────────────┘
                  │
                  ▼
      ┌────────────────────────┐
      │     seedMockData()     │
      │ (每次重置，塞入測試假資料)│
      └───────────┬────────────┘
                  │
                  │  ( 測試都 OK 了，準備上線！ )
                  ▼
      ┌────────────────────────┐
      │      Git Push 🚀       │ ◄── (這時候才把藍圖推上去)
      └───────────┬────────────┘
                  │
                  ▼
  ====================================
  【 階段二：雲端生產環境 (Production) 】
  ====================================
                  │
                  ▼
      ┌────────────────────────┐
      │  Zeabur 部署 (prestart) │
      └───────────┬────────────┘
                  │
                  ▼
      ┌────────────────────────┐
      │  npm run migration:run  │
      │  (雲端開機：自動讀藍圖施工)  │
      └───────────┬────────────┘
                  │
                  ▼
      ┌────────────────────────┐
      │  seedProductionData()
      │ (絕不重置！安全補齊預設資料)│
      └────────────────────────┘
```
