import { EntitySchema } from 'typeorm'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TNpUser = {
  id: string
  name: string
  email: string
  role: string
  password?: string
  created_at?: Date
  updated_at?: Date
}

// ==============================
// Entity Schema
// ==============================
export const NpUserSchema = new EntitySchema<TNpUser>({
  name: 'NpUser', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'neweb_users', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 320,
      nullable: false,
      unique: true,
    },
    role: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 72,
      nullable: false,
      select: false, // 查詢時預設不取出
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
    updated_at: {
      type: 'timestamptz',
      updateDate: true,
      nullable: false,
    },
  },
})
