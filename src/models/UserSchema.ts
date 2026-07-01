import { EntitySchema } from 'typeorm'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TUser = {
  id: string // 💡 主鍵是用 UUID (字串)
  age: number
  name: string
  role: string
  // email: string
}

// ==============================
// Entity Schema
// ==============================
export const UserSchema = new EntitySchema<TUser>({
  name: 'User', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'users', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    // id: {
    //   type: 'integer',
    //   primary: true,
    //   generated: 'increment', // 讓資料庫自動處理 SERIAL 遞增 (1, 2, 3...)
    //   nullable: false,
    // },
    id: {
      type: 'uuid', // UUID 型別
      primary: true,
      generated: 'uuid', // 資料庫自動處理 UUID 生成
      nullable: false,
    },
    age: {
      type: 'integer',
      nullable: true, // 允許空值，對應新註冊可能沒填資料的情況
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    role: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    // email: {
    //   type: 'varchar',
    //   nullable: true,
    // },
  },
})
