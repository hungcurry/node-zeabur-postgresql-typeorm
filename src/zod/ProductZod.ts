// src/zod/ProductZod.ts
import { z } from 'zod'

// ~方法1: zod 功能執行階段資料驗證
// npm i zod
// ORM 產生的型別（DB 導向）        => 代表資料庫的真實狀態（Data at Rest）
// Zod 的 產生的型別（輸入驗證導向） => 代表前端送來的資料（Data in Motion）
// ---------
// 1. 執行期驗證用的 Zod Schema
export const createProductZod = z.object({
  title: z.string().min(1, '商品名稱不能為空'),
  price: z.number().positive('價格必須大於 0'),
  stock: z.number().int().nonnegative('庫存不能為負數'),
  // .optional()
  // 就會自動變成 category?: string | undefined;。
  // 這就完美符合我們在 Service 層需要的「可傳、可不傳」的邏輯。
  category: z.string().trim().min(1, '分類名稱不能為空字串').optional(),
})
// Update Schema (Partial + 不允許空物件)
export const updateProductZod = createProductZod.partial().refine((data) => Object.keys(data).length > 0, {
  message: '至少要提供一個欄位進行更新',
})

// 2. 編譯期抽離出來的 TypeScript 型別 (這行就在這裡用到了！)
/**
 * PostgreSQL 感覺麻煩原因：
 * 嚴格型別 + ORM 分離驗證：比起 Mongoose 一條 Schema 全包，你得多寫一層 schema 做運行時驗證。
 * Update 部分欄位可選：Mongoose 自動容忍部分更新，Prisma/SQL 需要自己定義。
 * TypeScript 型別安全：想完全型別安全，你就得明確定義 CreateUserInput 和 UpdateUserInput。
 * 變寫2次
 */
export type TCreateProductInput = z.infer<typeof createProductZod>
export type TUpdateProductInput = z.infer<typeof updateProductZod>
// 產生結果
// export type TCreateProductInput = {
//   title: string;
//   price: number;
//   stock: number;
//   category? : string | undefined
// }

// export type TUpdateProductInput = {
//   title?: string;
//   price?: number;
//   stock?: number;
//   category? : string | undefined
// }

//-----------------------------------------------------

// ~方法2: 偷懶-就直接寫型別就好
// export type TCreateProductInput = {
//   title: string;
//   price: number;
//   stock: number;
//   category? : string | undefined
// }

// export type TUpdateProductInput = {
//   title?: string;
//   price?: number;
//   stock?: number;
//   category? : string | undefined
// }

// 使用方式
// import type { TCreateProductInput, TUpdateProductInput } from '../zod/ProductZod.js'
