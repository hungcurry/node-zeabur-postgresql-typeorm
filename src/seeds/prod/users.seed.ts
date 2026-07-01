import type { TUser } from '../../models/UserSchema.js'

/**
 * 正式環境所需的基礎系統資料
 * UUID 採用固定值，確保跨環境與多次執行時的一致性
 */
export const productionUsers: TUser[] = [
  {
    id: 'b4f61ed9-4564-4ef1-a2f5-f5413a2c0fb4',
    name: '測試typeorm',
    age: 25,
    role: 'admin',
    // email: 'admin@example.com'
  },
  {
    id: '36f9f4b4-b936-438c-8421-424c148c408a',
    name: 'currylee',
    age: 33,
    role: 'user',
    // email: 'currylee@example.com'
  },
]
