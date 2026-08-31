import crypto from 'node:crypto'

// ** 以下為金流串接相關加密、解密的 function，對應文件 P17 - P22
// https://cwww.newebpay.com/website/Page/content/download_api#1
// 線上交易─幕前支付技術串接手冊_NDNF-1.0.8-2.0 版本

type NewebPayOrder = {
  merchantOrderNo: string
  amount: number
  itemDesc?: string
  email?: string
}

// *針對這段藍新支付（NewebPay）的加密邏輯
/**
  簡單來說：TradeInfo 是內容（包裹），AES 是保險箱，TradeSha 是防偽封條。
  以下為你拆解這三個步驟到底在做什麼：
  ---
  1. createTradeInfo：將訂單資料「格式化」
  這一步還沒加密。它是把你的訂單資訊（金額、訂單編號、回傳網址）組合成像網址後面的參數字串。
  目的：讓藍新的伺服器讀得懂你的需求。
  格式範例：
  MerchantID=MS123456&Amt=100&MerchantOrderNo=20260410001&ItemDesc=點數卡...

  2. encryptTradeInfo (AES-256-CBC)：把資料「關進保險箱」
  這是對稱加密。藍新會給你一組 HashKey 和 HashIV，這兩把鑰匙就像是保險箱的密碼。
  為什麼要加？
  因為 TradeInfo 裡面包含金額、訂單編號，如果用明文傳輸，使用者在瀏覽器端可以直接修改金額（例如把 1000 元改成 1 元）。
  加密後：原本看得懂的文字會變成一串無意義的亂碼（Hex 格式），只有擁有鑰匙的藍新後端才能解開。

  3. createTradeSha (SHA-256)：貼上「防偽封條」
  這是一個不可逆的雜湊（Hash）。它把「加密後的內容」再配上鑰匙攪碎成一串固定長度的字串。
  為什麼要這步？
  為了讓藍新二度確認：「這份保險箱（AES 資料）在中途有沒有被掉包過？」
  如果有人攔截了封包，即便他打不開保險箱，但他換了一個新的保險箱給你，
  藍新只要對照 TradeSha，發現封條對不起來，就會拒絕交易。
*/

// 對應文件 P17
export const createTradeInfo = (
  order: NewebPayOrder, // 物件
  merchantId: string,
  version: string,
  notifyUrl: string,
  returnUrl: string,
) => {
  // 建立藍新支付協議要求的交易資料物件 (TradeInfo 原始明文)
  const data = {
    // 商店代號：由藍新核發的商店編號 (如: MS12345678)
    MerchantID: merchantId,
    // 回傳格式：指定藍新回傳參數時使用 JSON 格式 (建議固定為 JSON)
    RespondType: 'JSON',
    // 時間戳記：必須為 10 位數的 Unix Timestamp
    TimeStamp: Math.round(Date.now() / 1000).toString(),
    // 串接版本：依據藍新文件定義的版本號 (如: 1.6 或 2.0)
    Version: version,
    // 商店訂單編號：不可重複，由開發者自定義 (限 30 字，英數字與底線)
    MerchantOrderNo: order.merchantOrderNo,
    // 訂單金額：必須為純整數數字
    Amt: order.amount,
    // 商品名稱：顯示在藍新結帳頁面的描述 (限 50 字)
    ItemDesc: order.itemDesc || '健身方案',
    // 支付完成回傳網址：結帳後由藍新「引導使用者」回到前端的網址
    ReturnURL: returnUrl,
    // 支付通知網址：結帳後由藍新伺服器「主動通知」後端更新資料庫狀態的網址
    NotifyURL: notifyUrl,
    // 如果有 Email，加入交易資料
    ...(order.email ? { Email: order.email } : {}),
  }

  // 組成 URL Query String
  const queryString = Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return queryString
  /** 模擬假資料範例：
    MerchantID=MS123456
    &RespondType=JSON
    &TimeStamp=1713331234
    &Version=2.0
    &MerchantOrderNo=ORDER123
    &Amt=1000
    &ItemDesc=測試商品
    &ReturnURL=https://example.com/return
    &NotifyURL=https://example.com/api/notify
    &Email=test@gmail.com
  */

  // --------------
  // 將交易資料組成 URL Query String
  // MerchantID=MS12345678&TimeStamp=1663040304&Version=2.0&RespondType=Stri
  // ng&MerchantOrderNo=Vanespl_ec_1663040304&Amt=30&NotifyURL=https%3A%2F%2
  // Fwebhook.site%2Fd4db5ad1-2278-466a-9d66-
  // 78585c0dbadb&ReturnURL=&ItemDesc=test
}
// 對應文件 P17：AES-256-CBC 加密
export const encryptTradeInfo = (tradeInfo: string, hashKey: string, hashIV: string) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', hashKey, hashIV)
  let encrypted = cipher.update(tradeInfo, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}
// 對應文件 P18：SHA256 雜湊產生 TradeSha
export const createTradeSha = (encryptedTradeInfo: string, hashKey: string, hashIV: string) => {
  const raw = `HashKey=${hashKey}&${encryptedTradeInfo}&HashIV=${hashIV}`
  const sha = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase()
  return sha
}
// AES-256-CBC 解密（用於處理藍新回傳資料）
export const decryptTradeInfo = (encryptedData: string, hashKey: string, hashIV: string) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', hashKey, hashIV)
  decipher.setAutoPadding(false)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  // 移除 PKCS7 padding 及所有不可見控制字元
  // eslint-disable-next-line no-control-regex
  decrypted = decrypted.replace(/[\x00-\x1f]+/g, '')

  return JSON.parse(decrypted)
}
