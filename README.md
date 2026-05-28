
#### node-zeabur-postgresql
```jsx
// PostgreSQL Connect Command
// 給「人」在終端機輸入
psql "postgresql://root:RDU560JAVsZE92m17Pg4nSlN3zMXbQK8@tpe1.clusters.zeabur.com:22968"

// ~Zeabur選這個填
// PostgreSQL connection string
// 適合環境變數使用
postgresql://root:RDU560JAVsZE92m17Pg4nSlN3zMXbQK8@tpe1.clusters.zeabur.com:22968

// 如果要指定資料庫 +上
// XXXXX?authSource=admin
/nuxt3

// API網址
// ---
// ~Zeabur 使用index.html 測試
https://node-zeabur-postgresql.zeabur.app/users

// ~swagger
https://node-zeabur-postgresql.zeabur.app/api-docs

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
```

#### 專案架構
```jsx
node-zeabur-postgresql/
├── prisma/
│   └── schema.prisma         # 資料庫結構定義 (Single Source of Truth)
├── src/
│   ├── config/
│   │   └── db.ts             # Prisma Client 初始化與連線管理
│   ├── models/
│   │   └── User.ts           # 定義與資料庫對應的 TS 型別
│   ├── controllers/
│   │   └── userController.ts # 處理請求、呼叫 Service 並回傳回應
│   ├── services/             # (選填) 建議加入，專門放 Prisma 的查詢邏輯
│   │   └── userService.ts
│   ├── routes/
│   │   └── userRoutes.ts     # 路由定義
│   └── app.ts                # Express Middleware 與路由掛載
├── .env                      # 包含 DATABASE_URL
├── index.ts                  # 入口檔案 (啟動伺服器)
├── package.json              # 需加入 @prisma/client, typescript, ts-node 等
└── tsconfig.json             # 建議使用 NodeNext 或 ESNext 模組規範
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
# 安裝 生產環境 (dependencies)
npm install express cors dotenv zod pg @prisma/client @prisma/adapter-pg pino pino-http pino-roll cross-env

# 安裝 開發環境 (devDependencies)
npm install -D typescript tsx nodemon prisma pino-pretty @types/node @types/express @types/cors @types/pg


npm install @prisma/client
npm install prisma --save-dev

// Prisma 7 需要 PG 來連線資料庫
npm install @prisma/adapter-pg pg
npm install -D @types/pg

// 每當你修改了 schema.prisma，都必須執行：
npx prisma generate
```

```jsx
"scripts": {
  "dev": "prisma generate && nodemon --exec tsx index.ts",
  "build": "prisma generate && tsc",
  "start": "prisma generate && prisma db push && node dist/index.js",
  "db:push": "prisma db push"
},

dev (本地開發):
prisma generate: 確保你的 node_modules 裡有最新的型別，
這樣 tsx 跑起來才不會噴 did not initialize yet。
nodemon --exec tsx index.ts: 你最習慣的熱重載方式，負責即時監聽檔案變動。

build (Zeabur 編譯階段):
Zeabur 部署時會執行這行。先產生 Prisma Client，
然後用 tsc 把所有的 .ts 轉成 .js 放到 dist 資料夾。

start (Zeabur 運行階段):
prisma db push: 這很重要！因為 Zeabur 的資料庫可能是空的，
這行會自動幫你在雲端建立資料表。
node dist/index.js: 執行編譯後的正式版程式碼。

db:push (是你的 「手動同步工具」。):
在開發過程中，當你修改了 prisma/schema.prisma
例如新增了一個欄位或一張表），資料庫並不會自動知道這件事。
這時候你就需要執行 npm run db:push。
```



