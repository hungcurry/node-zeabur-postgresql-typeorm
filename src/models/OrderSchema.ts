import { EntitySchema } from 'typeorm'
import type { TProfile } from './ProfileSchema.js'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TOrder = {
  id: number
  amount: number

  // Timestamp  =>  1781245804387 (毫秒-number)
  // ----------
  createdAt: number
  updatedAt: number

  // 外來鍵關聯(FK)（DB 欄位）
  profile_id: number
  // TS才需要,relation（僅 runtime join 使用）
  profile?: TProfile
}

// ==============================
// Entity Schema
// ==============================
const bigintTransformer = {
  // bigint 透過 pg 驅動讀取時會回傳字串
  // 例如："1781248003298"
  // 使用 transformer 將字串轉成 number
  to: (value?: number) => value,
  from: (value: string) => Number(value),
}

// 誰有 Foreign Key，誰就是(子表)（Child）
export const OrderSchema = new EntitySchema<TOrder>({
  name: 'Order', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'orders', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      type: 'integer', // 整數型別
      primary: true, // 主鍵 (每筆資料唯一)
      generated: 'increment', // 自動遞增 (PostgreSQL 的 SERIAL)
      nullable: false, // 不可為空值
    },
    amount: {
      type: 'integer',
      nullable: false,
    },
    // Timestamp  =>  1781248003298 (毫秒-number)
    // ----------
    createdAt: {
      type: 'bigint',
      transformer: bigintTransformer,
    },
    updatedAt: {
      type: 'bigint',
      transformer: bigintTransformer,
    },
    // 外來鍵關聯(FK)
    profile_id: {
      type: 'integer',
      nullable: false,
    },
  },
  relations: {
    // profile: 虛擬要連結用的欄位:
    profile: {
      target: 'Profile', // 要連到哪個 Entity : Profile Entity
      type: 'many-to-one', // 關聯型態：多對一 (多個 Order 對應到一個 Profile)
      // joinColumn 每個屬性是誰寫誰
      // 誰有 Foreign Key，誰就是(子表)（Child）
      // -------------------------------------------------------------------------------------------
      // | name                     | 自己表(子表)           | orders    | 建立 `profile_id` 欄位
      // | referencedColumnName     | 對方表(父表)           | profiles  | 指向 `id` 欄位
      // | foreignKeyConstraintName | constraint 名稱        | orders    | 外鍵名稱
      // -------------------------------------------------------------------------------------------
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'profile_id', // 外來鍵關聯(FK) (Order 表的 profile_id)
        referencedColumnName: 'id', // 對方表 (Profile) 的主鍵欄位名稱
        foreignKeyConstraintName: 'order_profile_id_fk', // 外鍵約束名稱
      },
      // 雙向關聯 —— 兩邊都必須寫 inverseSide
      inverseSide: 'orders', // 指向 父表虛擬要連結用的欄位
    },
  },
})
