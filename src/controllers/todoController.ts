// ~舊 UUID 方式
// npm i uuid
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
import { randomUUID } from 'crypto'
// 引入 logger
import { createLogger } from '@/utils/logger.js'
import { handleError, appError } from '@/middlewares/errorHandle.js'
// type
import type { Request, Response, NextFunction } from 'express'
import type { TTodo, ApiResponse } from '@/type/index.js'

// ~logger參數順序：level, message, payload
const logger = createLogger('todoController')
// 模擬資料庫
let todos: TTodo[] = [
  {
    id: randomUUID(),
    title: '白爛貓',
  },
]

// Response 型別
// 資料庫使用語法 可能會回傳單一物件或陣列
// 這邊強制回傳陣列，統一格式，前端也好處理
type TTodoResponse = Response<ApiResponse<TTodo[]>>
// ===================
// ... 正常方式 ...
// ===================
/** *!新寫法  
 * * Express 5 throw會接住錯誤
 * 不需要 try-catch 了，直接 throw 就好，
 * Express 5 會自動捕捉到錯誤並傳遞給全域錯誤處理器
 * ------------

  export const getTodos = (req: Request, res: TTodoResponse, next: NextFunction) => {
    // const todos = await getDBUsers()

    let todos = null
    if (!todos) {
      // 直接 throw，Express 5 會接住
      throw new appError(400, '傳給前端看的訊息', '伺服端的message')
    }

    res.status(200).json({
      status: 'success',
      data: todos,
    })
  }

 */

export const handleGetTodos = async (req: Request, res: TTodoResponse, next: NextFunction) => {
  try {
    // 實務中這裡可能是
    // const todos = await TodoModel.find();

    // 🔥 人工製造錯誤,錯誤只會傳到server端,開發時候看到
    // throw new Error('Database connection timeout')

    // 訊息測試
    logger.setLog('info', 'Todo list successfully', { todoCount: todos.length })
    // logger.setLog('debug', 'Debug info', { rawData: 'some-internal-info' })
    // logger.setLog('warn', 'get list of tasks to done', { todoCount: todos.length })

    // 不寫.status(200),會預設帶入 200 "OK"。
    res.json({
      status: 'success',
      data: todos,
    })
  } 
  catch (error: any) {
    // ✅ 方式 2：錯誤捕捉 (error) -> 終端顯示紅色
    // 記錄 Log (給伺服器管理員看)
    logger.setLog('error', 'failed to get todo list', { error: error.message })

    // * 自訂義錯誤處理
    // handleError({
    //   res,
    //   statusCode: 400,
    //   message: '無法取得資料',
    //   err: error
    // })

    // * 將錯誤丟給全域處理器
    // ~傳遞錯誤給錯誤處理中間件
    // ~自訂錯誤訊息，讓客戶端知道發生了什麼錯誤
    // error.statusCode = 400
    // error.clientMessage = '無法取得待辦清單'
    // next(error)

    // 或
    // ~使用 appError 來創建一個新的錯誤物件，並傳遞給全域處理器
    // ~順序：statusCode, clientMessage, message( 原始錯誤訊息, 給開發者看的 )
    const AppError = new appError(400, '無法取得待辦清單', error.message)
    next(AppError)
  }
}
export const handleCreateTodo = async (req: Request, res: TTodoResponse) => {
  try {
    const { title } = req.body
    if (!title) return handleError({ res, message: 'title required' })

    const newTodo: TTodo = {
      id: randomUUID(),
      title,
    }
    todos.push(newTodo)

    res.status(201).json({
      status: 'success',
      data: todos,
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
export const handleUpdateTodo = async (req: Request, res: TTodoResponse) => {
  try {
    const { id } = req.params
    const { title } = req.body

    // 1. 直接尋找物件引用
    const todo = todos.find((item) => item.id === id)

    // 2. 提早回傳 (Guard Clauses)
    // 這裡雖然是邏輯判斷，但在 try 區塊內可以確保即使 todos 是 undefined 也能被捕捉
    if (!todo) return handleError({ res, message: 'id not found' })
    if (!title) return handleError({ res, message: 'title required' })

    // 3. 執行修改
    todo.title = title

    res.json({
      status: 'success',
      data: todos,
    })
  } 
  catch (error: any) {
    handleError({
      res,
      message: '更新失敗',
      statusCode: 400,
      err: error,
    })
  }
}
export const handleDeleteTodo = async (req: Request, res: TTodoResponse) => {
  try {
    const { id } = req.params
    const index = todos.findIndex((item) => item.id === id)

    if (index === -1) return handleError({ res, message: 'id not found' })

    // 執行刪除
    todos.splice(index, 1)

    res.json({
      status: 'success',
      data: todos,
    })
  } 
  catch (error: any) {
    handleError({
      res,
      message: '刪除失敗',
      statusCode: 500,
      err: error,
    })
  }
}
