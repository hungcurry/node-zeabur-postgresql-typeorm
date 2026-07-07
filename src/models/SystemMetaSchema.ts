import { EntitySchema } from 'typeorm'

export type TSystemMeta = {
  key: string
  value: string
  createdAt: Date
  updatedAt: Date
}

// ==============================
// TypeScript 型別 (僅用於資料庫模型)
// ==============================
export const SystemMetaSchema = new EntitySchema<TSystemMeta>({
  name: 'SystemMeta', // Entity 名稱 ( 單數 + PascalCase )
  tableName: 'system_metas', // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  columns: {
    key: {
      type: 'varchar',
      primary: true,
      length: 255,
    },
    value: {
      type: 'varchar',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
})
