import { EntitySchema } from 'typeorm'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export interface TRole {
  id: string // 💡 主鍵是用 UUID (字串)
  name: string
  description: string
  is_system: boolean
}

// ==============================
// Entity Schema
// ==============================
export const RoleSchema = new EntitySchema<TRole>({
  name: 'Role', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'roles', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      type: 'uuid', // UUID 型別
      primary: true,
      generated: 'uuid', // 資料庫自動處理 UUID 生成
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: true,
      unique: true,
    },
    description: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    is_system: {
      type: 'boolean',
      default: false,
      nullable: false,
    },
  },
})

