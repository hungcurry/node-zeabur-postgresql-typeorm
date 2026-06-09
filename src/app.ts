import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { httpLogger } from './utils/logger.js'
import { handleNotFound, handleGlobalError } from './middlewares/errorHandle.js'
import { swaggerDocs, swaggerUi } from './/utils/swagger.js'
// type
import type { Application, Request, Response, NextFunction } from 'express'
// router
import userRoutes from './routes/userRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'

// 定義 app 為 Express Application 型別
const app: Application = express()

// *中間件
// 自動處理 OPTIONS 請求與 CORS Header
app.use(cors())
// 解析 JSON 格式 (如 Axios)
app.use(express.json())
// 解析 Form 格式 (如藍新通知)
app.use(express.urlencoded({ extended: false }))
// Logger 配置
app.use(httpLogger)
// 設定靜態檔案資料夾
// 1. 手動模擬 __dirname (ESM 必備動作)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// 2. 設定靜態檔案資料夾
app.use(express.static(path.join(__dirname, 'public')))

// *Router
// app.get：直接定義單一路由
// app.use：引入外部路由模組（Router）
// 偵錯 Header
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Debug-Status', 'TS-Enabled-V2')
  next()
})
// 基礎路由
app.get('/', (req: Request, res: Response) => {
  res.send('Express Server is running and connected to Zeabur MongoDB (TS Version)!')
})
// 健康檢查 API
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})
// Swagger UI 提供靜態 API 文檔頁面
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.get('/test', (req, res) => {
  res.json({ ok: true })
})

// 模組化路由掛載
app.use('/users', userRoutes)
app.use('/todos', todoRoutes)
app.use('/auth', authRoutes)
app.use('/products', productRoutes)
// 錯誤處理,放在所有路由之後
app.use(handleNotFound)
app.use(handleGlobalError)

export default app
