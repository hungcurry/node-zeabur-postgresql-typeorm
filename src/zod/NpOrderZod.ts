// src/zod/OrderZod.ts
import { z } from 'zod'

// ~方法1: zod 功能執行階段資料驗證
// npm i zod
// Prisma 產生的型別（DB 導向）     => 代表資料庫的真實狀態（Data at Rest）
// Zod 的 產生的型別（輸入驗證導向） => 代表前端送來的資料（Data in Motion）
// ---------
// 1. 執行期驗證用的 Zod Schema
export const createOrderResultZod = z.object({
  paymentGateway: z.string().url('paymentGateway 必須為合法的 URL 格式'),
  MerchantID: z.string().trim().min(1, 'MerchantID 不能為空'),
  TradeInfo: z.string().trim().min(1, 'TradeInfo 不能為空'),
  TradeSha: z.string().trim().min(1, 'TradeSha 不能為空'),
  Version: z.string().trim().min(1, 'Version 不能為空'),
})

// 2. 編譯期抽離出來的 TypeScript 型別
export type TCreateOrderResult = z.infer<typeof createOrderResultZod>

// 產生結果
// export type TCreateOrderResult = {
//   paymentGateway: string // 藍新金流付款網址
//   MerchantID: string // 商店代號
//   TradeInfo: string // AES 加密資料
//   TradeSha: string // 防偽雜湊
//   Version: string // 版本號
// }

// -----------------------------------------------------

// ~方法2: 偷懶-就直接寫型別就好
// export type TCreateOrderResult = {
//   paymentGateway: string // 藍新金流付款網址
//   MerchantID: string // 商店代號
//   TradeInfo: string // AES 加密資料
//   TradeSha: string // 防偽雜湊
//   Version: string // 版本號
// }

// 使用方式範例：
// import type { TCreateOrderResult } from '../zod/OrderZod.js'
