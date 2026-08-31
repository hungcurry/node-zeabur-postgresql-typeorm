import { Router } from 'express'
import { authGuard } from '@/middlewares/authHandle.js'
// 使用解構賦值匯入 Controller 函式
import { handleCreateOrder } from '../controllers/npOrderController.js'

const router = Router()

// 前端這邊打API
// http://127.0.0.1:8080/orders/:creditPackageId

/**
 * 路由掛載
 * 備註：前綴 /orders 已在 app.ts 中定義
 */
// 負責定義 API 網址（End-points）和 HTTP 動詞（GET/POST），
// 然後把請求「轉交」給對應的 Controller 函式。
router.post('/:creditPackageId', handleCreateOrder)

export default router
