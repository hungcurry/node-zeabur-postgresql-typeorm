import bcrypt from 'bcryptjs'
// ~舊 UUID 方式
// npm i uuid
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
import { randomUUID } from 'crypto'
// 引入 logger
import { createLogger } from '@/utils/logger.js'
import { handleError , appError } from '@/middlewares/errorHandle.js'
import { signToken } from '@/utils/generateJWT.js'
// type
import type { Request, Response, NextFunction } from 'express'
import type { TTokenPayload, ApiResponse } from '@/type/index.js'

// ~logger參數順序：level, message, payload
const logger = createLogger('authController')
// 模擬資料庫儲存空間 (全域)
const usersTable: any[] = []

// --- 註冊邏輯( 前端UI 沒有做signup ) ---
// ~npm install bcryptjs @types/bcryptjs
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body

    // 1. 基本檢查
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: '欄位未填寫完整' })
    }

    // ---------------------------------------------------------
    // 2. 實務操作 (模擬資料庫行為)
    // ---------------------------------------------------------

    // a. 模擬檢查 Email 是否已存在
    // 假裝資料庫裡已經有一個 test@test.com
    if (email === 'test@test.com') {
      return res.status(409).json({
        status: 'error',
        message: '此 Email 已被註冊',
      })
    }

    // b. 使用 bcrypt 對密碼進行雜湊處理 (模擬加密)
    // 這裡的 12 是 saltRounds (鹽值數)，數值越高越安全但運算越久
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('加密後的密碼:', hashedPassword)

    // c. 模擬存入資料庫並取得新 ID
    // 這裡我們手動模擬一個資料庫回傳的 user 物件
    const id = randomUUID() // 產生如: '123e4567-e89b-12d3-a456-426614174000'
    const fakeNewUser = {
      _id: id,
      email,
      name: name || '新使用者',
      role: 'admin',
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    usersTable.push(fakeNewUser) // 真的存進陣列裡了

    // ---------------------------------------------------------
    // 3. 核發通行證 (Token) => 這邊是使用1 自動登入
    // ~註冊是否該給 Token ???
    // ~1. 註冊後「自動登入」（核發 Token）
    // ~2. 註冊後「需手動登入」（不核發 Token）
    // ---------------------------------------------------------
    const newUserPayload: TTokenPayload = {
      userId: fakeNewUser._id,
      role: fakeNewUser.role as 'admin' | 'user',
    }

    const token = signToken(newUserPayload)

    // 4. 回傳成功
    res.status(201).json({
      status: 'success',
      message: '註冊成功',
      token,
      user: {
        id: fakeNewUser._id,
        email: fakeNewUser.email,
        name: fakeNewUser.name,
      },
    })
  } 
  catch (error: any) {
    // * 自訂義錯誤處理
    // handleError({
    //   res,
    //   message: 'Signup Error錯誤',
    //   statusCode: 500,
    //   err: error
    // });

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
// --- 登入邏輯 ---
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  // {  前端傳過來的資料
  //   "email": "ooopp42@hotmail.com",
  //   "password": "123456"
  // }

  // 1. 這裡會去資料庫比對 email 和 password (省略實作)
  // const user = await User.findOne({ email }) ...

  // 假設驗證成功，取得使用者資訊
  const userData: TTokenPayload = {
    userId: 'user_12345',
    role: 'admin',
  }

  // 2. 呼叫你寫好的 signToken 產生 Token
  // 產生出來的JWT 沒有 Bearer 前綴，只有純粹的亂碼字串
  const token = signToken(userData)

  // 3. 回傳給前端
  res.status(200).json({
    status: 'success',
    token, // 前端 Vue 會拿到這串
    user: userData,
  })
}
// 假設驗證成功，取得使用者資訊
export const getProfile = (req: Request, res: Response) => {
  // *目的：讓後續的路由處理器可以直接從 req.user 拿到 userId 和 role 等資訊，方便做權限控制等操作。
  // const { userId } = (req as any).user;
  // const userData = await User.findById(userId);
  // res.json(userData);

  const userData = {
    userId: 'user_12345',
    role: 'admin',
  }

  res.json({        
    status: 'success',
    message: '令牌有效',
    user: userData,
  })
}
