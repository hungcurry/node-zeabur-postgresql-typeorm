import { EntitySchema } from 'typeorm'

// 定義 Profile 結構的 TypeScript 介面
export type TProfile = {
  id: number
  name: string
}

export const ProfileSchema = new EntitySchema<TProfile>({
  name: 'Profile', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'profiles', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
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
