import { Router } from 'express'
import { authGuard } from '@/middlewares/authHandle.js'
// 使用解構賦值匯入 Controller 函式
import { 
  handleSignup, 
  handleLogin, 
  handleGetProfile
} from '../controllers/authController.js'


const router = Router()

/**
 * 路由掛載
 * 備註：前綴 /auth 已在 app.ts 中定義
 */
// 負責定義 API 網址（End-points）和 HTTP 動詞（GET/POST），
// 然後把請求「轉交」給對應的 Controller 函式。
router.post('/signup', handleSignup)
router.post('/login', handleLogin)
router.get('/checkout', authGuard, handleGetProfile)

export default router
