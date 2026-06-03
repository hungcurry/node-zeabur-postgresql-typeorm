import { EntitySchema } from 'typeorm'
import type { TProfile } from './ProfileSchema.js'

// 定義 Order 結構的 TypeScript 介面
export type TOrder = {
  id: number
  user_id: number
  amount: number
  // TS才需要
  // 核心：必須明確定義這個關聯屬性，TypeORM 才能在 relations 中找到它
  profile?: TProfile
}

export const OrderSchema = new EntitySchema<TOrder>({
  name: 'Order', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'orders', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      primary: true, // 主鍵 (每筆資料唯一)
      type: 'integer', // 整數型別
      nullable: false, // 不可為空值
    },
    user_id: {
      type: 'integer',
      nullable: false,
    },
    amount: {
      type: 'integer',
      nullable: false,
    },
  },
  relations: {
    // profile: 虛擬要連結用的欄位:
    profile: {
      target: 'Profile', // 要連到哪個 Entity : Profile Entity
      type: 'many-to-one', // 關聯型態：多對一 (多個 Order 對應到一個 User)
      //
      // joinColumn 每個屬性是誰寫誰
      // | 屬性                      | 是誰的欄位              寫在哪個表 | 作用   |
      // | ------------------------ | ------------- | ----- | --------------- |
      // | name                     | 自己表           | orders    | 建立 `user_id` 欄位 |
      // | referencedColumnName     | 對方表           | profiles  | 指向 `id` 欄位      |
      // | foreignKeyConstraintName | constraint 名稱 | orders    | 外鍵名稱            |
      //
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'user_id', // 本表對應的欄位名稱 (Order 表的 user_id)
        referencedColumnName: 'id', // 對方表 (User) 的主鍵欄位名稱
        foreignKeyConstraintName: 'order_user_id_fk' // 外鍵約束名稱
      },
    },
  },
})
