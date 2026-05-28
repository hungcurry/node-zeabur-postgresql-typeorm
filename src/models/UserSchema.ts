import { EntitySchema } from 'typeorm'

// 定義 User 結構的 TypeScript 介面
export interface User {
  id: number
  name: string
}

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
  },
})
