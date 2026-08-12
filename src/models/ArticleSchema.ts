import { EntitySchema } from 'typeorm'

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export type TArticle = {
  id: string // 💡 主鍵是用 UUID (字串)
  title: string
  content: string
  status: 'published' | 'draft'
  createdAt?: Date
  updatedAt?: Date
}

// ==============================
// Entity Schema
// ==============================
export const ArticleSchema = new EntitySchema<TArticle>({
  name: 'Article', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'articles', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    id: {
      type: 'uuid', // UUID 型別
      primary: true, // 主鍵 (每筆資料唯一)
      generated: 'uuid', // 資料庫自動處理 UUID 生成
      nullable: false, // 不可為空值
    },
    title: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    content: {
      type: 'text',
      nullable: false,
    },
    // 限制這個欄位只能存入陣列裡設定的這幾種字串，並且預設值為 'draft'。
    status: {
      type: 'enum',
      enum: ['draft', 'published'],
      default: 'draft',
    },
    createdAt: {
      // DB 自動產生建立時間
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
    updatedAt: {
      // DB 更新時自動刷新
      type: 'timestamptz',
      updateDate: true,
      nullable: false,
    },
  },
  /**
   * 建立索引優化排序與搜尋效能
   * 1. Schema層  => 先建好目錄
   * articleSchema.index({ createdAt: -1 })
   * 預先評估這個資料表未來會用什麼欄位來排序（如 createdAt）或搜尋（如 title、email），
   * 直接把 index 設定好。
   * //-------------------
   * 2. Controller層  => 查目錄
   * Article.find().sort({ createdAt: -1 })
   * 依照業務邏輯寫 Article.find().sort(...)。因為 Schema 已經有 index，
   * 資料庫就會自動走高速公路，秒出結果！
   *
   * * 在 Schema 建立假排序小抄（後台加速用）
   * * Controller 層 (.sort) 下達真正要吐給前端畫面的排序（畫面呈現用）
   * * 結論: 只要有排序或查詢的需求，Schema 層的 index 就應該先建好。
   */
  indices: [
    // 時間排序 : -1 代表由大到小（新到舊）排列。
    {
      name: 'idx_articles_created_at',
      columns: ['createdAt'],
    },
    // 文字排序 : 1 代表由小到大（舊到新）排列。
    {
      name: 'idx_articles_title',
      columns: ['title'],
    },
  ],
})
