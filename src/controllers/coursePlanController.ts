// ~舊 UUID 方式
// npm i uuid
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
import { randomUUID } from 'crypto'
import { AppDataSource } from '@/config/database.js'
import { CoursePlanSchema } from '@/models/index.js'
// 引入 logger
import { createLogger } from '@/utils/logger.js'
import { handleError } from '@/middlewares/errorHandle.js'
// type
import type { Request, Response } from 'express'
import type { ApiResponse } from '@/type/index.js'
import type { TCoursePlan } from '@/models/index.js'
// import type { TCreateUserInput, TUpdateUserInput } from '@/zod/UserZod.js'

// ~logger參數順序：level, message, payload
const logger = createLogger('coursePlanController')

// Response 型別
// 資料庫使用語法 可能會回傳單一物件或陣列
// 這邊強制回傳陣列，統一格式，前端也好處理
type TCoursePlanResponse = Response<ApiResponse<TCoursePlan[]>>

export const handleGetCoursePlans = async (req: Request, res: TCoursePlanResponse) => {
  try {
    // 取得 TypeORM 的 Repository 實例
    const coursePlanRepository = AppDataSource.getRepository(CoursePlanSchema)
    // console.log('userRepository:', userRepository)

    // 會拿到一個陣列，即使只有一筆資料也是陣列
    // TypeORM 用法：find() 相當於 Prisma 的 findMany()
    const coursePlans = await coursePlanRepository.find()
    // console.log('coursePlans:', coursePlans)

    // 不寫,會預設帶入 200 "OK"。
    res.json({
      status: 'success',
      data: coursePlans as unknown as TCoursePlan[], // 確保 Entity 格式符合你定義的 TUser 介面
    })
  }
  catch (error: any) {
    handleError({
      res,
      message: '無法取得資料',
      statusCode: 500,
      err: error as Error,
    })
  }
}
