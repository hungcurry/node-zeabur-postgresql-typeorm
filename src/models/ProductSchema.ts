import { EntitySchema } from 'typeorm'

// 定義 Product 結構的 TypeScript 介面
export type TProduct = {
  id: number
  title: string
  price: number
  stock: number
}

export const ProductSchema = new EntitySchema<TProduct>({
  name: 'Product', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'products', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      type: 'integer',
      primary: true,
      // 對應 Prisma 的 @default(autoincrement())
      generated: 'increment',
      nullable: false,
    },
    title: {
      type: 'varchar',
      nullable: false,
    },
    price: {
      type: 'integer',
      nullable: false,
    },
    stock: {
      type: 'integer',
      nullable: false,
    },
  },
})
