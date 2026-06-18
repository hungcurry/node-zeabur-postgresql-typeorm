import { EntitySchema } from 'typeorm'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TCategory = {
  id: string
  name: string
}

// ==============================
// Entity Schema
// ==============================
export const CategorySchema = new EntitySchema<TCategory>({
  name: 'Category', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'categories', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
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
      type: 'uuid',
      primary: true,
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      nullable: false,
    },
  },
})
