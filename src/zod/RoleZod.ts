// src/zod/RoleZod.ts
import { z } from 'zod'

// ~方法1: zod 功能執行階段資料驗證
// npm i zod
// Prisma/TypeORM 產生的型別（DB 導向） => 代表資料庫的真實狀態（Data at Rest）
// Zod 的 產生的型別（輸入驗證導向）       => 代表前端送來的資料（Data in Motion）
// ---------
// 1. 執行期驗證用的 Zod Schema
export const createRoleZod = z.object({
  name: z.string({ message: '角色名稱必須是字串' }).trim().min(1, 'name 不能為空').max(100, '不能超過 100 個字元'),
  description: z.string({ message: '角色敘述必須是字串' }).trim().max(100, '不能超過 100 個字元').optional(),
  is_system: z.boolean({ message: '是否為系統內建必須是布林值' }).default(false),
})

// Update Schema (Partial + 不允許空物件)
export const updateRoleZod = createRoleZod.partial().refine((data) => Object.keys(data).length > 0, {
  message: '至少要提供一個欄位進行更新',
})

// 2. 編譯期抽離出來的 TypeScript 型別 (這行就在這裡用到了！)
/**
 * PostgreSQL 感覺麻煩原因：
 * 嚴格型別 + ORM 分離驗證：比起 Mongoose 一條 Schema 全包，你得多寫一層 schema 做運行時驗證。
 * Update 部分欄位可選：Mongoose 自動容忍部分更新，Prisma/SQL 需要自己定義。
 * TypeScript 型別安全：想完全型別安全，你就得明確定義 CreateRoleInput 和 UpdateRoleInput。
 * 變寫2次
 */
export type TCreateRoleInput = z.infer<typeof createRoleZod>
export type TUpdateRoleInput = z.infer<typeof updateRoleZod>
// 產生結果
// export type TCreateRoleInput = {
//   name: string;
//   description?: string;
//   is_system: boolean;
// }

// export type TUpdateRoleInput = {
//   name?: string;
//   description?: string;
//   is_system?: boolean;
// }

//-----------------------------------------------------

// ~方法2: 偷懶-就直接寫型別就好
// export type TCreateRoleInput = {
//   name: string;
//   description?: string;
//   is_system: boolean;
// }

// export type TUpdateRoleInput = {
//   name?: string;
//   description?: string;
//   is_system?: boolean;
// }

// 使用方式
// import type { TCreateRoleInput, TUpdateRoleInput } from '../zod/RoleZod.js'
