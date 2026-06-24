// 沒有mongoose.connect()那種功能,所以封裝 URL 替換邏輯
/**
 * 純粹的連線字串轉換工具，不依賴任何外部環境變數
 * @param baseUrl 原始的 DATABASE_URL
 * @param dbName 要切換的資料庫名稱
 */
export const getConnectionString = (baseUrl: string, dbName: string): string => {
  if (!baseUrl) return ''
  try {
    const parsedUrl = new URL(baseUrl)
    // 動態修改網址路徑為斜線加上資料庫名稱，例如：/nuxt3
    parsedUrl.pathname = `/${dbName}`
    return parsedUrl.toString()
  } 
  catch (error) {
    console.error('DATABASE_URL 格式錯誤，無法解析：', error)
    return baseUrl // 若解析失敗，安全降級回原本的 URL
  }
}
