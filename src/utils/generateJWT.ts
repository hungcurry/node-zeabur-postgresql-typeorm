// ~npm install jsonwebtoken
// ~npm install --save-dev @types/jsonwebtoken

import jwt from 'jsonwebtoken'
import { getConfig } from '@/config/env/index.js'
import type { SignOptions } from 'jsonwebtoken'
import type { TTokenPayload } from '@/type/index.js'

const JWT_SECRET = getConfig<string>('secret.jwtSecret')
const JWT_EXPIRES_IN = getConfig<string>('secret.jwtExpiresDay') as SignOptions['expiresIn']

// *簽發 Token
export const signToken = (payload: TTokenPayload): string => {
  // 1. 防呆機制：如果忘記在 .env 設定密鑰，直接報錯，不讓你亂發 Token
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in config')

  // 2. 設定這張通行證的「規則」
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN, // 這張票多久後會過期？（例如：1小時）
    algorithm: 'HS256', // 蓋章加密的演算法（就像是規定印章的樣式）
  }

  // 3. 正式發票：把「資料」、「密鑰」、「規則」丟進去，產生一串亂碼字串
  // 產生出來的JWT 沒有 Bearer 前綴，只有純粹的亂碼字串
  return jwt.sign(payload, JWT_SECRET, options)
}

// * 驗證 Token
export const verifyToken = (token: string): TTokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TTokenPayload
  } 
  catch (error: any) {
    throw new Error(error.message || 'Invalid or expired token')
  }
}
