import { Router } from 'express'
// 使用解構賦值匯入 Controller 函式
import {
  handleGetArticles,
  // handleCreateArticle,
  // handleUpdateArticle,
  // handleDeleteRArticle,
} from '../controllers/articleController.js'

const router = Router()

/**
 * 路由掛載
 * 備註：前綴 /roles 已在 app.ts 中定義
 */

// GET /api/articles?page=1&limit=10&search=關鍵字
router.get('/', handleGetArticles)

export default router
