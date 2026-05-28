import { EntitySchema } from 'typeorm'
import type { User } from './UserSchema.js'

// 定義 Order 結構的 TypeScript 介面
export interface Order {
  id: number
  user_id: number
  amount: number
  // 核心：必須明確定義這個關聯屬性，TypeORM 才能在 relations 中找到它
  user?: User
}

export const OrderSchema = new EntitySchema<Order>({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      nullable: false,
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
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'orders_user_id_fk',
      },
    },
  },
})
