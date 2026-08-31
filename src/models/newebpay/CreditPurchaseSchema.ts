import { EntitySchema } from 'typeorm'
import type { TNpUser } from './NpUserSchema.js'
import type { TCoursePlan } from './CoursePlanSchema.js'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TCreditPurchase = {
  // 信用購買紀錄 資料表
  id: string
  // 購買的課堂 7 / 14 / 21 堂
  purchased_credits: number
  price_paid: number
  // 建立時間 : 2026-08-13 07:08:21.312
  created_at: Date
  // 購買時間
  purchase_at: Date

  // 外來鍵關聯(FK)（DB 欄位）
  // --------------
  // 使用者 ID
  neweb_users_id: string
  // 課程方案 ID
  course_plans_id: string

  // TS才需要,relation（僅 runtime join 使用）
  // 與 NpUser ( 使用者資料表 ): 虛擬要連結用的欄位
  np_user?: TNpUser
  // 與 CoursePlan ( 課程方案資料表 ): 虛擬要連結用的欄位
  course_plan?: TCoursePlan
}

// ==============================
// Entity Schema
// ==============================
// 誰有 Foreign Key，誰就是(子表)（Child）
export const CreditPurchaseSchema = new EntitySchema<TCreditPurchase>({
  name: 'CreditPurchase', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'credit_purchases', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    // 購買的課堂 7 / 14 / 21 堂
    purchased_credits: {
      type: 'integer',
      nullable: false,
    },
    // 金額
    price_paid: {
      type: 'numeric', // 定點小數
      precision: 10,
      scale: 2, // 代表小數點後固定保留 2 位
      nullable: false,
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
    // 購買時間
    purchase_at: {
      type: 'timestamptz',
      nullable: false,
    },
    // 外來鍵關聯(FK)
    // --------------
    // 使用者 ID
    neweb_users_id: {
      type: 'uuid',
      nullable: false,
    },
    // 課程方案 ID
    course_plans_id: {
      type: 'uuid',
      nullable: false,
    },
  },
  relations: {
    // np_user ( 使用者資料表 ): 虛擬要連結用的欄位:
    np_user: {
      target: 'NpUser', // 要連到哪個 Entity : NpUser Entity
      type: 'many-to-one', // 關聯型態：多對一 (多個 CreditPurchase 對應到一個 NpUser)
      // joinColumn 每個屬性是誰寫誰
      // 誰有 Foreign Key，誰就是(子表)（Child）
      // -----------------------------------------------------------------------
      // | name                     | 自己表(子表)           CreditPurchase
      // | referencedColumnName     | 對方表(父表)           NpUser
      // | foreignKeyConstraintName | constraint 名稱       credit_purchase_neweb_users_id_fk
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'neweb_users_id', // 外來鍵關聯(FK) ( CreditPurchase 表的 neweb_users_id )
        referencedColumnName: 'id', // 對方表 ( NpUser ) 的主鍵欄位名稱
        foreignKeyConstraintName: 'credit_purchase_neweb_users_id_fk', // 外鍵約束名稱
      },
    },
    // course_plan ( 課程方案資料表 ): 虛擬要連結用的欄位:
    course_plan: {
      target: 'CoursePlan', // 要連到哪個 Entity : CoursePlan Entity
      type: 'many-to-one', // 關聯型態：多對一 (多個 CreditPurchase 對應到一個 CoursePlan )
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'course_plans_id', // 外來鍵關聯(FK) ( CreditPurchase 表的 course_plans_id )
        referencedColumnName: 'id', // 對方表 ( CoursePlan ) 的主鍵欄位名稱
        foreignKeyConstraintName: 'credit_purchase_course_plans_id_fk', // 外鍵約束名稱
      },
    },
  },
})
