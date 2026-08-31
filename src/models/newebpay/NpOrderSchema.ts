import { EntitySchema } from 'typeorm'
import type { TNpUser } from './NpUserSchema.js'
import type { TCoursePlan } from './CoursePlanSchema.js'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TNpOrder = {
  // 訂單 ID
  id: string
  // 商店自訂訂單編號
  merchant_order_no: string
  // 方案交易金額 1400 / 2520 / 4800
  amount: number
  // 購買的課堂 7 / 14 / 21 堂
  purchased_credits: number
  // 付款狀態
  payment_status: string
  // 藍新金流交易序號
  newebpay_trade_no?: string | null
  // 付款方式
  payment_type?: string | null
  // 付款完成時間 : 2026-08-13 15:10:29.446
  paid_at?: Date | null
  // 建立時間 : 2026-08-13 07:08:21.312
  created_at: Date

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
export const NpOrderSchema = new EntitySchema<TNpOrder>({
  name: 'NpOrder', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'neweb_orders', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    // 訂單 ID
    id: {
      primary: true, // 主鍵 (每筆資料唯一)
      type: 'uuid', // UUID 型別
      generated: 'uuid', // 新增資料時自動生成 UUID
      nullable: false, // 不可為空值
    },
    // 商店自訂訂單編號
    merchant_order_no: {
      type: 'varchar', // 字串型別
      length: 30, // 最大長度 50
      unique: true, // 唯一性約束
      nullable: false,
    },
    // 方案交易金額 1400 / 2520 / 4800
    amount: {
      type: 'integer', // 整數型別
      nullable: false,
    },
    // 購買的課堂 7 / 14 / 21 堂
    purchased_credits: {
      type: 'integer',
      nullable: false,
    },
    // 付款狀態
    payment_status: {
      type: 'varchar',
      length: 20,
      default: 'unpaid', // 未付款
      nullable: false,
    },
    // 藍新金流交易序號
    newebpay_trade_no: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    // 付款方式
    payment_type: {
      type: 'varchar', // CREDIT 信用卡
      length: 20,
      nullable: true,
    },
    // 付款完成時間 : 2026-08-13 15:10:29.446
    // paid_at：不要加 createDate: true 等金流成功回傳時，再由程式碼手動更新：
    paid_at: {
      type: 'timestamptz', // 時間戳記
      nullable: true,
    },
    // 建立時間 : 2026-08-13 07:08:21.312
    created_at: {
      type: 'timestamptz',
      createDate: true,
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
      type: 'many-to-one', // 關聯型態：多對一 (多個 NpOrder 對應到一個 NpUser)
      // joinColumn 每個屬性是誰寫誰
      // 誰有 Foreign Key，誰就是(子表)（Child）
      // -----------------------------------------------------------------------
      // | name                     | 自己表(子表)           NpOrder
      // | referencedColumnName     | 對方表(父表)           NpUser
      // | foreignKeyConstraintName | constraint 名稱       np_order_neweb_users_id_fk
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'neweb_users_id', // 外來鍵關聯(FK) ( NpOrder 表的 neweb_users_id )
        referencedColumnName: 'id', // 對方表 ( NpUser ) 的主鍵欄位名稱
        foreignKeyConstraintName: 'np_order_neweb_users_id_fk', // 外鍵約束名稱
      },
    },
    // course_plan ( 課程方案資料表 ): 虛擬要連結用的欄位:
    course_plan: {
      target: 'CoursePlan', // 要連到哪個 Entity : CoursePlan Entity
      type: 'many-to-one', // 關聯型態：多對一 (多個 NpOrder 對應到一個 CoursePlan )
      joinColumn: {
        // 設定 Join 的資料庫欄位
        name: 'course_plans_id', // 外來鍵關聯(FK) ( NpOrder 表的 course_plans_id )
        referencedColumnName: 'id', // 對方表 ( CoursePlan ) 的主鍵欄位名稱
        foreignKeyConstraintName: 'np_order_course_plans_id_fk', // 外鍵約束名稱
      },
    },
  },
})
