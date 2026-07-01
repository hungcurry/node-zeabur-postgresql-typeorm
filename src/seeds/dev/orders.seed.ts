import type { TOrder } from '../../models/OrderSchema.js'

export const mockOrders: TOrder[] = [
  {
    id: 1,
    amount: 500,

    // ⚠️ 註意：使用 new Date() 或 Date.now()！
    // 服務重啟觸發 Seed 重寫時，會動態抓取「當下系統時間」
    // 導致舊的假資料，因時間更新而跑到最上方（變最新）
    // 除非寫死固定歷史時間 new Date('2026-01-01T00:00:00.000Z')

    // Timestamp
    // Date.now() => 1781244480123 (毫秒-number)
    // --------
    createdAt: Date.now(),
    updatedAt: Date.now(),

    // 外來鍵關聯(FK)
    profile_id: 101,
  },
  {
    id: 2,
    amount: 300,
    // Timestamp
    // Date.now() => 1781244480123 (毫秒-number)
    // --------
    createdAt: Date.now(),
    updatedAt: Date.now(),

    // 外來鍵關聯(FK)
    profile_id: 102,
  },
]
