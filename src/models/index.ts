// *轉發的寫法（精簡成一步）這一行同時完成了「引入」與「導出」
// ==============================
// 1. 統一導出所有的 TypeScript 型別 (使用 export type)
// ==============================
// === 無關連表 ===
export type { TSystemMeta } from './SystemMetaSchema.js'
export type { TUser } from './UserSchema.js'
export type { TRole } from './RoleSchema.js'
// === 父表 (主表) ===
export type { TProfile } from './ProfileSchema.js'
export type { TCategory } from './CategorySchema.js'
// === 子表 (從表) ===
export type { TOrder } from './OrderSchema.js'
export type { TProduct } from './ProductSchema.js'

// ==============================
// 2. 統一導出所有的 TypeORM EntitySchema
// ==============================
// === 無關連表 ===
export { SystemMetaSchema } from './SystemMetaSchema.js'
export { UserSchema } from './UserSchema.js'
export { RoleSchema } from './RoleSchema.js'
// === 父表 (主表) ===
export { ProfileSchema } from './ProfileSchema.js'
export { CategorySchema } from './CategorySchema.js'
// === 子表 (從表) ===
export { OrderSchema } from './OrderSchema.js'
export { ProductSchema } from './ProductSchema.js'

// ==============================
// 3. 額外打包一個陣列，方便 TypeORM DataSource 初始化時直接引入
// ==============================
// === 無關連表 ===
import { SystemMetaSchema } from './SystemMetaSchema.js'
import { UserSchema } from './UserSchema.js'
import { RoleSchema } from './RoleSchema.js'
// === 父表 (主表) ===
import { ProfileSchema } from './ProfileSchema.js'
import { CategorySchema } from './CategorySchema.js'
// === 子表 (從表) ===
import { OrderSchema } from './OrderSchema.js'
import { ProductSchema } from './ProductSchema.js'

export const allEntities = [
  // === 無關連表 ===
  SystemMetaSchema,
  UserSchema,
  RoleSchema,
  // === 父表 (主表) ===
  ProfileSchema,
  CategorySchema,
  // === 子表 (從表) ===
  OrderSchema,
  ProductSchema,
]
