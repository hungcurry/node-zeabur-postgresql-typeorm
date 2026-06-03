// ~舊 UUID 方式
// npm i uuid
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
import { randomUUID } from 'crypto'
// 替換為 TypeORM 的 AppDataSource 與 User Entity
import { AppDataSource } from '@/config/database.js'
import { UserSchema } from '@/models/UserSchema.js'
// 引入 logger
import { createLogger } from '@/utils/logger.js'
import { handleError } from '@/middlewares/errorHandle.js'
// type
import type { Request, Response } from 'express'
import type { TUser, ApiResponse } from '@/type/index.js'
import type { CreateUserInput, UpdateUserInput } from '@/models/UserSchema.js'

// ~logger參數順序：level, message, payload
const logger = createLogger('userController')

// Response 型別
// 資料庫使用語法 可能會回傳單一物件或陣列
// 這邊強制回傳陣列，統一格式，前端也好處理
type TUserResponse = Response<ApiResponse<TUser[]>>

export const getAllUsers = async (req: Request, res: TUserResponse) => {
  try {
    // 取得 TypeORM 的 Repository 實例
    const userRepository = AppDataSource.getRepository(UserSchema)
    console.log('userRepository:', userRepository)

    // 會拿到一個陣列，即使只有一筆資料也是陣列
    // TypeORM 用法：find() 相當於 Prisma 的 findMany()
    const users = await userRepository.find()
    console.log('users:', users)

    // 不寫,會預設帶入 200 "OK"。
    res.json({
      status: 'success',
      data: users as unknown as TUser[], // 確保 Entity 格式符合你定義的 TUser 介面
    })
  } 
  catch (error: unknown) {
    handleError({
      res,
      message: '無法取得資料',
      statusCode: 500,
      err: error as Error,
    })
  }
}

export const createUser = async (req: Request, res: TUserResponse) => {
  try {
    const data: CreateUserInput = req.body
    // 取得 TypeORM 的 Repository 實例
    const userRepository = AppDataSource.getRepository(UserSchema)
    // 會拿到單一物件
    // TypeORM 用法：先 create 建立實例，再用 save 寫入資料庫
    const userInstance = userRepository.create(data)
    const savedUser = await userRepository.save(userInstance)

    res.status(201).json({
      status: 'success',
      data: [savedUser as unknown as TUser],
    })
  } 
  catch (error: unknown) {
    handleError({
      res,
      message: '新增失敗',
      statusCode: 400,
      err: error as Error,
    })
  }
}

export const updateUser = async (req: Request, res: TUserResponse) => {
  // ! 注意：這裡的 ID 格式驗證需要根據實際使用的資料庫類型來調整。
  // MongoDB 預設使用字串,ID 範例 => "65a1b2c3d4e5f6a7b8c9d0e1"
  // PostgreSQL 預設通常使用遞增整數Int,ID 範例 => 1, 2, 105
  const { id } = req.params // ( 這邊有改 適用UUID )
  // 1. 型別防禦：確保 id 存在且必須是單純的字串
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ status: 'error', data: [], message: 'ID 格式錯誤' })
  }
  // 2. 格式驗證：現在 TypeScript 100% 確定 id 是 string 了，可以安全使用 .test()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ status: 'error', data: [], message: 'ID 格式錯誤（非有效 UUID）' })
  }

  try {
    const data: UpdateUserInput = req.body

    // TypeORM 用法：先尋找該使用者是否存在
    // 取得 TypeORM 的 Repository 實例
    const userRepository = AppDataSource.getRepository(UserSchema)
    const user = await userRepository.findOneBy({ id })

    if (!user) {
      res.status(404).json({
        status: 'error',
        data: [],
        message: '找不到該使用者',
      })
      return
    }

    // 將新資料合併到原有的 Entity 實例，並儲存更新
    userRepository.merge(user, data)
    const updatedUser = await userRepository.save(user)

    res.json({
      status: 'success',
      data: [updatedUser as unknown as TUser],
    })
  } 
  catch (error: unknown) {
    handleError({
      res,
      message: '更新失敗',
      statusCode: 400,
      err: error as Error,
    })
  }
}

export const deleteUser = async (req: Request, res: TUserResponse) => {
  // ! 注意：這裡的 ID 格式驗證需要根據實際使用的資料庫類型來調整。
  // MongoDB 預設使用字串,ID 範例 => "65a1b2c3d4e5f6a7b8c9d0e1"
  // PostgreSQL 預設通常使用遞增整數Int,ID 範例 => 1, 2, 105
  const { id } = req.params // ( 這邊有改 適用UUID )
  // 1. 型別防禦：確保 id 存在且必須是單純的字串
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ status: 'error', data: [], message: 'ID 格式錯誤' })
  }
  // 2. 格式驗證：現在 TypeScript 100% 確定 id 是 string 了，可以安全使用 .test()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ status: 'error', data: [], message: 'ID 格式錯誤（非有效 UUID）' })
  }

  try {
    // TypeORM 用法：先查詢是否存在
    const userRepository = AppDataSource.getRepository(UserSchema)
    const user = await userRepository.findOneBy({ id })

    if (!user) {
      res.status(404).json({
        status: 'error',
        data: [],
        message: '找不到該使用者',
      })
      return
    }

    // 執行移除
    await userRepository.remove(user)

    res.json({
      status: 'success',
      data: [],
      message: '刪除成功',
    })
  } 
  catch (error: unknown) {
    handleError({
      res,
      message: '刪除失敗',
      statusCode: 500,
      err: error as Error,
    })
  }
}
