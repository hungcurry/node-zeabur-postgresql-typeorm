import { EntitySchema } from 'typeorm'
import type { TOrder } from './OrderSchema.js'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TProfile = {
  id: number
  name: string

  // 一個用戶擁有多個訂單
  // 這邊通常會是陣列 包 物件
  orders?: TOrder[]
}

// ==============================
// Entity Schema
// ==============================
export const ProfileSchema = new EntitySchema<TProfile>({
  name: 'Profile', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'profiles', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      // ~正常設定
      // type: 'integer',
      // generated: 'increment', // 遞增
      // primary: true,
      // nullable: false,
      // ------------------
      // ~自訂義 數字 101
      // 手動指定 主鍵值（如 101）時
      // 不能設定 generated: 'increment'（流水號遞增）
      // 不能設定 generated: 'uuid'（自動生成 UUID）
      // 不然資料庫會自己寫遞增數字 123.. 然後跟自訂義相撞（如 101）
      // ------------------
      type: 'integer',
      primary: true,
      // generated: 'increment' 這邊自訂義101 所以不能寫
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
  },
  // 如果沒開雙向,這不用寫
  relations: {
    // orders: 虛擬要連結用的欄位 ( 1對多 用複數 ):
    orders: {
      target: 'Order', // 要連到哪個 Entity : Order Entity
      // 反向映射
      // ---------------
      // 虛擬的反向關聯：一個用戶 profile 擁有多個訂單 order
      // type 設定了 'one-to-many'， 1對多
      // 組裝資料時，預設就一定會把它轉成 陣列 []
      type: 'one-to-many',
      // 雙向關聯 —— 兩邊都必須寫 inverseSide
      inverseSide: 'profile', // 指向 子表虛擬要連結用的欄位
    },
  },
})
