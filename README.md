#### node-zeabur-postgresql-typeorm

```jsx
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

// API網址
// ---
// ~Zeabur 使用index.html 測試
https://node-zeabur-postgresql-typeorm.zeabur.app/users

// ~swagger
https://node-zeabur-postgresql-typeorm.zeabur.app/api-docs

// ~ 本機 使用postman 測試
// PORT=8080
http://localhost:8080/todos

// ~查看 8080 port
// netstat -ano | findstr :8080

// ~清除 占用 8080 的程序
// npm run clean:port
// "scripts": {
//   "clean:port": "npx kill-port 8080"
// },

// ~ 啟動資料庫
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
