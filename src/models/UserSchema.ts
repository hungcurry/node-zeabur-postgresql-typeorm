import { EntitySchema } from 'typeorm'

// 定義 User 結構的 TypeScript 介面
export type TUser = {
  id: string
  age: number | null
  name: string | null
  role: string | null
}

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
      type: 'uuid', // 💡 1. 修改型別為 uuid
      primary: true,
      generated: 'uuid', // 💡 2. 讓 TypeORM / 資料庫自動處理 UUID 生成
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
  },
})

// ~方法2: 偷懶-就直接寫型別就好
export interface CreateUserInput {
  name: string
  age: number
  role: string
}

export interface UpdateUserInput {
  name?: string
  age?: number
  role?: string
}

// 使用方式
// import type { CreateUserInput, UpdateUserInput } from '../models/UserSchema.js';
