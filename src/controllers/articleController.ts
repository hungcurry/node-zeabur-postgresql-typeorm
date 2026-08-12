// ~舊 UUID 方式
// npm i uuid
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
import { randomUUID } from 'crypto'
import { ILike } from 'typeorm'
import { AppDataSource } from '@/config/database.js'
import { ArticleSchema } from '@/models/index.js'
// 引入 logger
import { createLogger } from '@/utils/logger.js'
import { handleError } from '@/middlewares/errorHandle.js'
// type
import type { Request, Response } from 'express'
import type { ApiResponse } from '@/type/index.js'
import type { TArticle } from '@/models/index.js'
// import type { TCreateArticleInput, TUpdateArticleInput } from '@/zod/ArticleZod.js'

// ~logger參數順序：level, message, payload
const logger = createLogger('articleController')

// Response 型別
// 資料庫使用語法 可能會回傳單一物件或陣列
// 定義含分頁的 Payload 物件型別
type TArticlesData = {
  articles: TArticle[]
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
// type TArticleResponse = Response<ApiResponse<TArticle[]>>
type TArticleResponse = Response<ApiResponse<TArticlesData>>

// 取得 TypeORM 的 Repository 實例
const articleRepository = AppDataSource.getRepository(ArticleSchema)

// 導入分頁與搜尋管道
const handleAggregate = async (page: number, limit: number, search?: string) => {
  // 建立 TypeORM 查詢條件與選項
  // 相當於原本 Mongoose pipeline 陣列段

  // 1. 如果有搜尋關鍵字，加入篩選條件 (不區分大小寫 ILike / 模糊搜尋 Like)
  // 在原本 Mongoose 中使用 $match: { title: { $regex: search, $options: 'i' } }
  const whereCondition = search
    ? { title: ILike(`%${search}%`) } // 💡 用 ILike，忽略大小寫！
    : {}

  // 2. 使用 findAndCount 同時計算總數與獲取當頁資料
  // 相當於原本 Mongoose 使用 $facet 同時計算 totalCount 與 limit/skip
  // page = 2（第二頁）、limit = 3（每頁顯示 3 筆）
  const [data, totalCount] = await articleRepository.findAndCount({
    where: whereCondition,
    // -1 依照時間「由新而舊」排序, 新文章在前 (TypeORM 中設定 'DESC')
    order: { createdAt: 'DESC' },
    // 數學計算： (2 - 1) * 3 = 1 * 3 = 3
    // 白話意思： 「跳過前 3 筆資料不看。」
    skip: (page - 1) * limit,
    // 接下來只抓取 3 筆資料
    take: limit,
  })

  // 模擬原本 Mongoose $facet 吐出的結構，維持 Controller 解析介面一致
  return [
    {
      count: [{ totalCount }],
      data,
    },
  ]
}
// 取得文章列表 Controller (支援分頁與搜尋)
export const handleGetArticles = async (req: Request, res: TArticleResponse) => {
  try {
    // ?page=1&limit=3&search=vue
    // console.log(`query`, req.query)
    // { page: '1', limit: '3' }

    // 解析並防呆分頁參數與搜尋字串
    // 使用 Math.max 確保 page 最小為 1
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10))
    // 使用 Math.min/Math.max 限制 limit 範圍在 1 ~ 100 之間，防範惡意大量抓取
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '10', 10)))
    const search = req.query.search as string | undefined
    console.log(`查詢請求`, { page, limit, search })
    // 查詢請求 { page: 1, limit: 3, search: undefined }

    // ---------------------------------------------------
    // 會拿到一個陣列，即使只有一筆資料也是陣列
    // const users = await userRepository.find()
    // * 進階 findAndCount 寫法 (替代 Mongoose aggregate)
    const result = await handleAggregate(page, limit, search)
    console.log('result:', JSON.stringify(result, null, 2))
    // result: [
    //   {
    //     "count": [
    //       { "totalCount": 12 }
    //     ],
    //     "data": [
    //       { 3筆資料... }
    //     ],
    //   }
    // ]

    // 解析 $facet 出來的結果
    const totalCount = result[0]?.count[0]?.totalCount || 0
    const articles = result[0]?.data || []

    if (articles.length === 0) {
      console.log('DB 沒有資料')
    }

    // 3. 計算分頁元數據 (Pagination Metadata)
    // 無條件進位 (Math.ceil)：4 / 3 = 1.333頁 => 2頁
    const totalPages = Math.ceil(totalCount / limit) // 12 / 4
    const hasNextPage = page < totalPages // 1 < 2 true
    const hasPrevPage = page > 1 // 1 > 1 flase

    // 4. 記錄成功 log
    logger.setLog('info', '分頁查詢成功', {
      articleCount: articles.length,
      totalCount,
    })

    // 5. 回傳統一格式
    res.json({
      status: 'success',
      data: {
        articles,
        pagination: {
          totalCount,           // 12  總資料
          totalPages,           // 4   總頁數
          currentPage: page,    // 1   當前頁數
          limit,                // 3   當頁幾筆資料
          hasNextPage,          // true  下一頁
          hasPrevPage,          // false 上一頁
        },
      },
    })
  } 
  catch (error: any) {
    handleError({
      res,
      message: '無法取得文章資料',
      statusCode: 500,
      err: error,
    })
  }
}
