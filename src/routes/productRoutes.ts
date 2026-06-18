import { Router } from 'express'
// 使用解構賦值匯入 Controller 函式
import { 
  handleGetProducts,
  handleCreateProduct,
  handleUpdateProduct
} from '../controllers/productController.js'

const router = Router()

/**
 * 路由掛載
 * 備註：前綴 /products 已在 app.ts 中定義
 */

// 負責定義 API 網址（End-points）和 HTTP 動詞（GET/POST），
// 然後把請求「轉交」給對應的 Controller 函式。
router.get('/', handleGetProducts)
router.post('/', handleCreateProduct)
router.patch('/:id', handleUpdateProduct)

export default router
