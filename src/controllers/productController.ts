// ~舊 UUID 方式
// npm i uuid
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
import { randomUUID } from 'crypto'
// services + zod驗證
import { createProductZod, updateProductZod } from '../zod/ProductZod.js'
import { getProducts, createProduct, updateProduct } from '../services/product.service.js'
// 引入 logger
import { createLogger } from '@/utils/logger.js'
import { handleError } from '@/middlewares/errorHandle.js'
// type
import type { Request, Response } from 'express'

// ~logger參數順序：level, message, payload
const logger = createLogger('productController')

export const handleGetProducts = async (req: Request, res: Response) => {
  try {
    // 直接呼叫 Service 撈取全量資料，不需傳入任何參數
    const productsData = await getProducts()

    // 直接回傳成功結果與商品陣列
    res.json({
      status: 'success',
      data: productsData,
    })
  } 
  catch (error: any) {
    handleError({
      res,
      message: '無法取得資料',
      statusCode: 500,
      err: error,
    })
  }
}
export const handleCreateProduct = async (req: Request, res: Response) => {
  // 1. 安全解析前端傳來的 body (執行期驗證)
  const result = createProductZod.safeParse(req.body)
  // ~如果故意 庫存輸入負數，會得到以下驗證結果：
  // #region 驗證結果
  // console.log('驗證結果', result)
  // 驗證結果 {
  //   success: false,
  //   error: ZodError: [
  //     {
  //       "origin": "number",
  //       "code": "too_small",
  //       "minimum": 0,
  //       "inclusive": true,
  //       "path": [
  //         "stock"
  //       ],
  //       "message": "庫存不能為負數"
  //     }
  //   ]

  // title : 商品名稱不能為空
  // price : 價格必須大於 0
  // stock : 庫存不能為負數
  // #endregion

  // 2. 驗證失敗：直接阻擋並回傳錯誤訊息
  if (!result.success) {
    return handleError({
      res,
      message: '驗證失敗',
      statusCode: 400,
      // err: result.error.issues
      err: result.error.flatten().fieldErrors,
    })
  }

  try {
    // 3. 驗證成功：將 result.data 丟給 Service 層處理
    const newProduct = await createProduct(result.data)

    // 4. 回傳成功結果
    return res.status(201).json({
      status: 'success',
      data: newProduct,
    })
  } 
  catch (error: any) {
    handleError({
      res,
      message: '新增失敗',
      statusCode: 400,
      err: error,
    })
  }
}
export const handleUpdateProduct = async (req: Request, res: Response) => {
  // 1. 從網址參數中取得商品 ID
  const { id } = req.params

  // 確保 id 存在且必須是字串
  if (!id || typeof id !== 'string') {
    return handleError({
      res,
      message: '無效或缺失的商品 ID',
      statusCode: 400,
    })
  }

  // 2. 安全解析前端傳來的 body (執行期驗證)
  const result = updateProductZod.safeParse(req.body)

  // 3. 驗證失敗：直接阻擋並回傳錯誤訊息
  if (!result.success) {
    return handleError({
      res,
      message: '更新資料驗證失敗',
      statusCode: 400,
      err: result.error.flatten().fieldErrors,
    })
  }

  try {
    // 4. 驗證成功：將 id 與 result.data 丟給 Service 層處理
    const updatedProduct = await updateProduct(id, result.data)

    // 5. 回傳成功結果
    return res.json({
      status: 'success',
      data: updatedProduct,
    })
  } 
  catch (error: any) {
    handleError({
      res,
      message: error.message || '更新失敗',
      statusCode: error.message === '商品不存在' ? 404 : 400,
      err: error,
    })
  }
}
