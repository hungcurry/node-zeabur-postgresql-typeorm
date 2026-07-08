import type { TProduct } from '../../models/index.js'

export const mockProducts: TProduct[] = [
  {
    id: 'f68089ce-5aac-4ded-aef8-d26bd5ddb2d0',
    title: '極致黑人體工學椅',
    price: 5800,
    stock: 15,

    // ⚠️ 註意：使用 new Date() 或 Date.now()！
    // 服務重啟觸發 Seed 重寫時，會動態抓取「當下系統時間」
    // 導致舊的假資料，因時間更新而跑到最上方（變最新）
    // 除非寫死固定歷史時間 new Date('2026-01-01T00:00:00.000Z')

    // ISO 8601
    // new Date() => Date (object)
    // 然後TypeOrm 自己會再轉.toISOString()
    // => '2026-06-12T06:08:46.000Z' (string)
    // --------
    createdAt: new Date(),
    updatedAt: new Date(),

    // Timestamp
    // Date.now() => 1781244480123 (毫秒-number)
    // --------
    // createdAt: Date.now(),
    // updatedAt: Date.now(),

    // 外來鍵關聯(FK)
    category_id: 'a8e3d2f1-5b7c-4a9e-8d23-7f6e5d4c3b2a',
  },
]
