import { EntitySchema } from 'typeorm'

// 定義 User 結構的 TypeScript 介面
export type TUser = {
  id: number
  name: string
}

export const UserSchema = new EntitySchema<TUser>({
  name: 'User', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'users', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
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
