import { EntitySchema } from 'typeorm'
import type { TCategory } from './CategorySchema.js'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TProduct = {
  id: string // 💡 主鍵是用 UUID (字串)
  title: string
  price: number
  stock: number

  // ISO 8601
  // Date (object) => Fri Jun 12 2026 14:33:53 GMT+0800
  // 然後TypeOrm 自己會再轉 2026-06-12T06:08:46.000Z
  // ----------
  createdAt: Date
  updatedAt: Date

  // #region Timestamp
  // Timestamp  =>  1781245804387 (毫秒-number)
  // ----------
  // createdAt: number
  // updatedAt: number
  // #endregion

  // 外來鍵關聯(FK)（DB 欄位）
  category_id: string
  // TS才需要,relation（僅 runtime join 使用）
  category?: TCategory
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
export const ProductSchema = new EntitySchema<TProduct>({
  name: 'Product', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'products', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      type: 'uuid', // UUID 型別
      primary: true, // 主鍵 (每筆資料唯一)
      generated: 'uuid', // 資料庫自動處理 UUID 生成
      nullable: false, // 不可為空值
    },
    title: {
      type: 'varchar',
      nullable: false,
      unique: true, // 唯一值
    },
    price: {
      type: 'integer',
      nullable: false,
    },
    stock: {
      type: 'integer',
      nullable: false,
    },
    // ISO 8601 => "2026-06-12T06:08:46.000Z"
    // ----------
    createdAt: {
      // DB 自動產生建立時間
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
    updatedAt: {
      // DB 更新時自動刷新
      type: 'timestamptz',
      updateDate: true,
      nullable: false,
    },
    // #region Timestamp
    // Timestamp  =>  1781248003298 (毫秒-number)
    // ----------
    // createdAt: {
    //   type: 'bigint',
    //   transformer: bigintTransformer,
    // },
    // updatedAt: {
    //   type: 'bigint',
    //   transformer: bigintTransformer,
    // },
    // #endregion

    // 外來鍵關聯(FK)
    category_id: {
      type: 'uuid',
      nullable: false,
    },
  },
  relations: {
    // category: 虛擬要連結用的欄位:
    category: {
      target: 'Category', // 要連到哪個 Entity : Category Entity
      type: 'many-to-one', // 關聯型態：多對一 (多個 Product 對應到一個 Category)
      // joinColumn 每個屬性是誰寫誰
      // 誰有 Foreign Key，誰就是(子表)（Child）
      // -------------------------------------------------------------------------------------------
      // | name                     | 自己表(子表)           | products    | 建立 `category_id` 欄位
      // | referencedColumnName     | 對方表(父表)           | categories  | 指向 `id` 欄位
      // | foreignKeyConstraintName | constraint 名稱        | products    | 外鍵名稱
      // -------------------------------------------------------------------------------------------
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'category_id', // 外來鍵關聯(FK) (Product 表的 category_id)
        referencedColumnName: 'id', // 對方表 (Category) 的主鍵欄位名稱
        foreignKeyConstraintName: 'product_category_id_fk', // 外鍵約束名稱
      },
    },
  },
})
