// #region import logger
// ---------------
// ~logger方式01: Morgan
// npm i D morgan
// npm i D @types/morgan
// import logger from 'morgan';
// app.use(logger('dev'));

// ~logger方式02: pino-http
// npm install pino pino-http pino-roll
// npm install -D pino-pretty

/**
 * 使用方式
 * ------------------------------------
    // *引入 logger
    import { createLogger } from '@/utils/logger.js'

    // *logger參數順序：level, message, payload
    const logger = createLogger('todoController')

    export const getTodos = async (req: Request, res: Response) => {
      try {
        const todos = await db.todos.findMany();

        // ✅ 方式 1：成功路徑 (預設 info) -> 終端顯示綠色
        logger.setLog('info', '取得代辦清單成功', { todoCount: todos.length });

        // ✅ 方式 2： 🔥 人工製造錯誤 -> 終端顯示紅色
        // 錯誤只會傳到server端,開發時候看到
        throw new Error('Database connection timeout');

        // ✅ 方式 3：警告資訊 (warn) -> 終端顯示黃色
        logger.setLog('warn', 'get list of tasks to done', { todoCount: todos.length })
        
        // ✅ 方式 4：開發除錯 (debug) -> 終端顯示紫色
        logger.setLog('debug', 'Debug info', { rawData: 'some-internal-info' })

        res.json(todos);
      } 
      catch (err: any) {
        // ✅ 方式 2：錯誤捕捉 (error) -> 終端顯示紅色
        // 記錄 Log (給伺服器管理員看)
        logger.setLog('error', 'failed to get user list', { err: err.message })

        res.status(500).json({ error: 'Server Error' });
      }
    }
 * ------------------------------------
 */
// #endregion

import pino from 'pino'
import path from 'node:path'
import pretty from 'pino-pretty'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { pinoHttp } from 'pino-http'
import { AsyncLocalStorage } from 'async_hooks'
// 建立一個存放 Response 物件的保險箱
const responseStorage = new AsyncLocalStorage<any>()

// =======================================================
// 1️⃣ 環境判斷與預設 Log 等級
// =======================================================
const isDevelopment = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'
const currentLevel = isDevelopment ? 'debug' : 'info'

// =======================================================
// 2️⃣ Response.locals 型別定義
// 用來在 request lifecycle 中暫存 log 相關資訊
// =======================================================
export interface PinoHttpLocals {
  bizMsg?: string // 業務訊息 (例如：todoController)
  logLevel?: 'info' | 'warn' | 'error' | 'debug' // 指定 log 等級
  payload?: Record<string, unknown> // 額外資料 (例如：todoCount)
}

// =======================================================
// 3️⃣ 確保 logs 目錄存在
// =======================================================
const logDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// =======================================================
// 4️⃣ 敏感資料過濾
// 避免 password / token 等資訊被寫入 log
// =======================================================
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization']
function sanitizeBody(body: unknown) {
  if (!body || typeof body !== 'object') return body

  try {
    const clone = JSON.parse(JSON.stringify(body))

    for (const key of SENSITIVE_KEYS) {
      if (key in clone) {
        clone[key] = '***'
      }
    }

    return clone
  } catch {
    return '[Unparseable Body]'
  }
}

// =======================================================
// 5️⃣ Logger Stream 設定
// =======================================================

// 定義 ANSI 顏色代碼
const colors = {
  reset: '\x1b[0m',
  pink: '\x1b[95m', // 用於 Key
  yellow: '\x1b[33m', // 用於 Value
  gray: '\x1b[90m', // 用於冒號
}

const consoleStream = pretty({
  colorize: true,
  translateTime: 'HH:MM:ss.l',
  ignore: 'pid,hostname,req,res,responseTime,err',

  // ✅ 1. 明確將 log 宣告為 Record<string, any>，允許讀取任意鍵值
  messageFormat: (log: Record<string, any>, messageKey: string) => {
    const msg = log[messageKey]
    let payloadStr = ''

    const omitKeys = [
      messageKey,
      'level',
      'time',
      'pid',
      'hostname',
      'req',
      'res',
      'responseTime',
      'msg',
      'bizMsg',
      'displayMsg',
    ]

    // 遍歷其餘 payload 並上色
    Object.keys(log).forEach((key) => {
      if (!omitKeys.includes(key)) {
        const val = typeof log[key] === 'object' ? JSON.stringify(log[key]) : log[key]

        // ✨ 在這裡加上顏色：Key 是粉色，Value 是黃色
        payloadStr += `\n    ${colors.pink}${key}${colors.gray}: ${colors.yellow}${val}${colors.reset}`
      }
    })

    // ✅ 2. 安全地提取 displayMsg 並確保它是字串型別，徹底解決 .trim() 噴錯
    const displayMsg = log.displayMsg
    const hasDisplayMsg = typeof displayMsg === 'string' && displayMsg.trim() !== ''
    const messageLine = hasDisplayMsg ? `\n    log-message: "${displayMsg.trim()}"` : ''

    return `${msg}${messageLine}${payloadStr}`
  },

  include: 'level,time',
  sync: true,
})

// 偵測目前是不是在 Jest 或 Vitest 測試環境下
const isTestEnv = (globalThis as any).jest !== undefined || (globalThis as any).vi !== undefined
const streams: pino.StreamEntry[] = [
  {
    level: currentLevel,
    stream: consoleStream,
  },
]

// ~只有在「非生產環境」且「不是測試環境」時，才加上檔案記錄功能
// (!isProd && !isTestEnv)
if (!isTestEnv) {
  streams.push({
    level: currentLevel,
    stream: pino.transport({
      target: 'pino-roll',
      options: {
        file: path.join(logDir, 'app'),
        frequency: 'daily',
        extension: '.log',
        dateFormat: 'yyyy-MM-dd',
        mkdir: true,
        limit: { count: 7 },
      },
    }),
  })
}

const multiStream = pino.multistream(streams)
;(multiStream as any).level = currentLevel

// =======================================================
// 6️⃣ 建立核心 Logger
// =======================================================
export const logger = pino(
  {
    level: currentLevel,
    messageKey: 'log-message',
    timestamp: pino.stdTimeFunctions.isoTime,

    formatters: {
      level(label) {
        return { level: label }
      },
    },
  },
  multiStream,
)

// =======================================================
// 7️⃣ setLog 輔助函式
// 修改點：將 msg 對應到你要求的檔案名稱位置 (bizMsg)
// =======================================================
export const setLog = (
  res: any,
  fileTag: string,
  level: PinoHttpLocals['logLevel'] = 'info',
  logMsg: string = '',
  payload: Record<string, unknown> = {},
) => {
  const locals = res.locals as PinoHttpLocals
  locals.bizMsg = fileTag
  locals.payload = { ...payload, displayMsg: logMsg }
  locals.logLevel = level
}

// =======================================================
// 8️⃣ 決定檔案標籤的工廠函式 (你要的新寫法)
// =======================================================
export const createLogger = (fileTag: string) => {
  return {
    setLog: (
      level: PinoHttpLocals['logLevel'] = 'info',
      logMsg: string = '',
      // 改成 object | undefined，這樣呼叫端傳什麼物件進來都行
      payload?: object,
    ) => {
      const res = responseStorage.getStore()
      if (!res) return

      // 這裡使用類型斷言 (as) 轉給底層，因為我們知道傳進來的一定是物件
      setLog(res, fileTag, level, logMsg, payload as Record<string, unknown>)
    },

    // 捷徑方法也一併修改
    info: (msg: string, payload?: object) =>
      setLog(responseStorage.getStore(), fileTag, 'info', msg, payload as Record<string, unknown>),
    warn: (msg: string, payload?: object) =>
      setLog(responseStorage.getStore(), fileTag, 'warn', msg, payload as Record<string, unknown>),
    error: (msg: string, payload?: object) =>
      setLog(responseStorage.getStore(), fileTag, 'error', msg, payload as Record<string, unknown>),
  }
}

// =======================================================
// 9️⃣ HTTP Logger Middleware
// =======================================================
export const baseHttpLogger = pinoHttp({
  logger,

  genReqId: (req: any) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),

  customLogLevel: (_req, res, error) => {
    const locals = (res as any).locals as PinoHttpLocals | undefined

    // 1️⃣ 優先權最高：如果程式有拋出 Error，或是你在 setLog 手動指定了等級
    // 這樣即使是 400，只要有 Error 物件或是手動指定，都會是 error
    if (error || locals?.logLevel === 'error' || res.statusCode >= 500) return 'error'

    // 2️⃣ 優先權次之：讀取自定義的其他等級 (如 'info', 'warn' 等)
    if (locals?.logLevel) return locals.logLevel

    // 3️⃣ 預設自動判斷：將 400 區段從 warn 改為 error
    if (res.statusCode >= 400) return 'error'

    return 'info'
  },

  customErrorObject: () => ({}),

  serializers: {
    // 💡 優化 req 序列化
    req: (req: any) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      body: sanitizeBody(req.raw?.body),
      // 增加以下欄位
      query: req.query, // 取得 URL 參數
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        // 不建議記錄授權資訊，避免洩漏 token
        // authorization: undefined
      },
    }),
    res: (res: any) => {
      const headers = typeof res.getHeaders === 'function' ? res.getHeaders() : (res.headers ?? {})

      return {
        statusCode: res.statusCode,
        headers: {
          'x-powered-by': headers['x-powered-by'],
          'access-control-allow-origin': headers['access-control-allow-origin'],
          etag: headers['etag'],
        },
      }
    },
    err: pino.stdSerializers.err, // 確保標準 Error 物件能正確轉寫
  },

  // 成功 log 訊息格式：GET /todos 200 - 4ms | todoController
  customSuccessMessage: (req: any, res: any, responseTime: number) => {
    const locals = res.locals as PinoHttpLocals | undefined
    const url = req.originalUrl || req.url
    const bizMsg = locals?.bizMsg ? ` | ${locals.bizMsg}` : ''

    return `${req.method} ${url} ${res.statusCode} - ${responseTime}ms${bizMsg}`
  },

  // 將 payload 展開到 Log 的一級節點，以便 pino-pretty 抓取
  customProps: (_req, res: any) => (res.locals as PinoHttpLocals)?.payload || {},

  autoLogging: {
    ignore: (req: any) => ['/favicon.ico', '/health'].includes(req.url || ''),
  },
})
// 封裝 Middleware，將 res 存入 AsyncLocalStorage
export const httpLogger = (req: any, res: any, next: any) => {
  responseStorage.run(res, () => {
    baseHttpLogger(req, res, next)
  })
}

export const getChildLogger = (prefix: string) => logger.child({ module: prefix })
