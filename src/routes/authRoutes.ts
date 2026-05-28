import { Router } from 'express'
// 使用解構賦值匯入 Controller 函式
import { login, signup, getProfile } from '../controllers/authController.js'
import { authGuard } from '@/middlewares/authHandle.js'

const router = Router()

/**
 * 路由掛載
 * 備註：前綴 /auth 已在 app.ts 中定義
 */
router.post('/signup', signup)
router.post('/login', login)

router.get('/checkout', authGuard, getProfile)

export default router
