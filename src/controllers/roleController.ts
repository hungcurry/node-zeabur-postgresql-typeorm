// ~舊 UUID 方式
// npm i uuid
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
import { randomUUID } from 'crypto'
import { AppDataSource } from '@/config/database.js'
import { RoleSchema } from '@/models/index.js'
// 引入 logger
import { createLogger } from '@/utils/logger.js'
import { handleError } from '@/middlewares/errorHandle.js'
// type
import type { Request, Response } from 'express'
import type { ApiResponse } from '@/type/index.js'
import type { TRole } from '@/models/index.js'
import type { TCreateRoleInput, TUpdateRoleInput } from '@/zod/RoleZod.js'

// ~logger參數順序：level, message, payload
const logger = createLogger('roleController')

// Response 型別
// 資料庫使用語法 可能會回傳單一物件或陣列
// 這邊強制回傳陣列，統一格式，前端也好處理
type TRoleResponse = Response<ApiResponse<TRole[]>>

export const handleGetRoles = async (req: Request, res: TRoleResponse) => {
  try {
    // 取得 TypeORM 的 Repository 實例
    const roleRepository = AppDataSource.getRepository(RoleSchema)
    // console.log('roleRepository:', roleRepository)

    // 會拿到一個陣列，即使只有一筆資料也是陣列
    // TypeORM 用法：find() 相當於 Prisma 的 findMany()
    const roles = await roleRepository.find()
    // console.log('roles:', roles)

    // 不寫,會預設帶入 200 "OK"。
    res.json({
      status: 'success',
      data: roles as unknown as TRole[], // 確保 Entity 格式符合你定義的 TRole 介面
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
export const handleCreateRole = async (req: Request, res: TRoleResponse) => {
  try {
    const data: TCreateRoleInput = req.body
    // 取得 TypeORM 的 Repository 實例
    const roleRepository = AppDataSource.getRepository(RoleSchema)
    // 會拿到單一物件
    // TypeORM 用法：先 create 建立實例，再用 save 寫入資料庫
    const roleInstance = roleRepository.create(data)
    const savedRole = await roleRepository.save(roleInstance)

    res.status(201).json({
      status: 'success',
      data: [savedRole as unknown as TRole],
    })
  } 
  catch (error: any) {
    // 💡 移除 any 關鍵字，符合 strict 思維
    handleError({
      res,
      message: '新增失敗',
      statusCode: 400,
      err: error as Error,
    })
  }
}
export const handleUpdateRole = async (req: Request, res: TRoleResponse) => {
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
    const data: TUpdateRoleInput = req.body

    // TypeORM 用法：先尋找該角色是否存在
    // 取得 TypeORM 的 Repository 實例
    const roleRepository = AppDataSource.getRepository(RoleSchema)
    const role = await roleRepository.findOneBy({ id })

    if (!role) {
      res.status(404).json({
        status: 'error',
        data: [],
        message: '找不到該角色', // 💡 提示詞中文化調整
      })
      return
    }

    // 將新資料合併到原有的 Entity 實例，並儲存更新
    roleRepository.merge(role, data)
    const updatedRole = await roleRepository.save(role)

    res.json({
      status: 'success',
      data: [updatedRole as unknown as TRole],
    })
  } 
  catch (error: any) {
    // 💡 移除 any 關鍵字，符合 strict 思維
    handleError({
      res,
      message: '更新失敗',
      statusCode: 400,
      err: error as Error,
    })
  }
}
export const handleDeleteRole = async (req: Request, res: TRoleResponse) => {
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
    const roleRepository = AppDataSource.getRepository(RoleSchema)
    const role = await roleRepository.findOneBy({ id })

    if (!role) {
      res.status(404).json({
        status: 'error',
        data: [],
        message: '找不到該角色', // 💡 提示詞中文化調整
      })
      return
    }

    // 執行移除
    await roleRepository.remove(role)

    res.json({
      status: 'success',
      data: [],
      message: '刪除成功',
    })
  } 
  catch (error: any) {
    // 💡 移除 any 關鍵字，符合 strict 思維
    handleError({
      res,
      message: '刪除失敗',
      statusCode: 500,
      err: error as Error,
    })
  }
}
