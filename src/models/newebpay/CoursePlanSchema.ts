import { EntitySchema } from 'typeorm'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TCoursePlan = {
  // 堂數方案資料表
  id: string // 方案編號（UUID）
  name: string // 方案名稱
  credit_amount: number //  包含堂數
  price: number // 方案價格
  created_at: Date // 建立時間
}

// ==============================
// Entity Schema
// ==============================
export const CoursePlanSchema = new EntitySchema<TCoursePlan>({
  name: 'CoursePlan', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'course_plans', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
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
      unique: true,
    },
    credit_amount: {
      type: 'integer',
      nullable: false,
    },
    price: {
      type: 'numeric', // 定點小數
      precision: 10,
      scale: 2,  // 代表小數點後固定保留 2 位
      nullable: false,
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
  },
})
