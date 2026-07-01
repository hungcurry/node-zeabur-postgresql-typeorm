import { getConfig } from '../config/env/index.js'
// type
import type { Request, Response, NextFunction } from 'express'
import type { ApiResponse } from '../type/index.js'

type TErrorOptions = {
  res: Response
  statusCode?: number
  message?: string
  err?: any
}
// 回傳給前端的資料結構
type TErrorResponse = {
  status: 'error'
  statusCode: number
  message: string
  detail?: {
    name: string
    message: string
    stack: string
  }
}

const nodeEnv = getConfig<string>('db.nodeEnv')

/** 1. 自定義錯誤處理  
 * 
 *  * 使用方式：
 *  import { handleError } from '../middlewares/errorHandle.js'
 *  try {
 *    ....
 *  }
 *  catch (error: any) {
      handleError({ 
        res, 
        statusCode: 400, 
        message: '無法取得資料', 
        err: error 
      });
    }
 * 
 */
const handleError = ({ res, statusCode = 400, message = '無法取得資料', err }: TErrorOptions) => {
  const response: ApiResponse<TErrorOptions> = {
    status: 'error',
    statusCode,
    message,
    ...(err && { error: err.message || err }),
  }
  res.status(statusCode).json(response)
}

/** 2. 404 路由處理
 *
 *  * 使用方式：
 *  import { handleNotFound } from '../server/middlewares/errorHandler.js'
 *  app.use(handleNotFound)
 *
 */
const handleNotFound = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `API Not Found 奇怪？ 找不到路徑: ${req.originalUrl}`,
  })
}

/** 3. 捕捉 全域錯誤處理 中間件
 *
 * * 使用方式：
 * import { handleGlobalError } from '../middlewares/errorHandle.js'
 * app.use(handleGlobalError)
 *
 * * handleGlobalError 的作用：
 * 主要功能：作為 Express 應用的錯誤處理中間件，
 * 用來處理從路由或中間件傳遞過來的所有錯誤。
 * 它會依據錯誤的類型或狀態，回應不同的 HTTP 狀態碼和錯誤訊息
 * 讓用戶能夠知道發生了什麼錯誤。
 *
 */
const handleGlobalError = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 是否為開發環境 production 或 dev
  const isDev = nodeEnv === 'development'
  // 狀態碼
  const statusCode = err.statusCode || err.status || 500
  // clientMessage 給前端看的
  let clientMessage = err.clientMessage || err.message || '伺服器內部錯誤'

  // 正式環境隱藏 500 真實錯誤
  if (!isDev && statusCode >= 500) {
    clientMessage = '系統發生異常，請稍後再試'
  }

  // 簡化 Stack Trace 邏輯
  const getSimplifiedStack = (stack?: string): string => {
    if (!stack) return 'No stack trace available'
    return stack
      .split('\n')
      .slice(0, 3)
      .map((line) => line.trim())
      .join('\n')
  }

  // 開發環境錯誤日誌
  // if (isDev) {
  //   console.error('================ ERROR ================')
  //   console.error(`[isDev]: ${isDev}`)
  //   console.error(`[名稱]: ${err.name}`)
  //   console.error(`[狀態code]: ${statusCode}`)
  //   console.error(`[自訂]: ${err.clientMessage || '無自訂訊息'}`)
  //   console.error(`---- detail ----`)
  //   console.error(`[訊息]: ${err.message}`)
  //   console.error(`[堆疊]:\n${err.stack}`)
  //   console.error('=======================================')
  // }

  // 建立回應物件
  const response: TErrorResponse = {
    status: 'error',
    statusCode,
    message: clientMessage,
  }

  // 開發環境才附加 detail
  if (isDev) {
    response.detail = {
      name: err.name || 'Error',
      message: err.message || 'Unknown Error',
      stack: getSimplifiedStack(err.stack),
    }
  }

  res.status(statusCode).json(response)
}
class appError extends Error {
  public readonly statusCode: number
  public readonly clientMessage: string
  public readonly isOperational: boolean

  constructor(statusCode: number = 500, clientMessage: string = '系統發生異常', message?: string) {
    // 傳給父類別 Error 的 message，優先用原始錯誤，否則用 clientMessage
    super(message || clientMessage)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.clientMessage = clientMessage
    this.isOperational = true // 標記為可預期的業務錯誤

    // 排除建構函數本身的堆疊追蹤
    Error.captureStackTrace(this, this.constructor)
  }
}

export { handleError, handleNotFound, handleGlobalError, appError }
