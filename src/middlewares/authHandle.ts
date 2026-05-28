import { verifyToken } from '@/utils/generateJWT.js'
import type { Request, Response, NextFunction } from 'express'

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  // 1. 先從 Header 拿到完整的字串："Bearer eyJhbGci..."
  const authHeader = req.headers.authorization
  // *console.log(`authHeader:`, authHeader)
  // authHeader: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9......


  // 2. 檢查格式 (使用 Optional Chaining 確保安全性)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  // 修正：先取出 token，並確保它真的存在
  // 切開後會變成一個陣列：["Bearer", "eyJhbGci..."]
  // 取出索引為 1 的那個元素，也就是「純 Token」
  const token = authHeader.split(' ')?.[1]

  // 3. 如果 token 是 undefined 或空字串，同樣視為未授權
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Malformed token' })
  }

  try {
    const decoded = verifyToken(token)
    // console.log(`decoded:`, decoded);
    // decoded: {
    //   userId: 'user_12345',
    //   role: 'admin',
    //   iat: 1777440316,
    //   exp: 1780032316
    // }

    // 3. 將資訊掛載到 req 上
    ;(req as any).user = decoded

    // *目的：讓後續的路由處理器可以直接從 req.user 拿到 userId 和 role 等資訊，方便做權限控制等操作。
    // const { userId } = (req as any).user; 
    // const userData = await User.findById(userId);
    // res.json(userData);

    next()
  } 
  catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' })
  }
}
