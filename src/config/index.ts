import 'dotenv/config' // 確保第一行加載環境變數
// env
import db from './db.js'
import secret from './secret.js'
const config = {
  db,
  secret,
}

export const getConfig = <T = any>(path: string): T => {
  if (!path) throw new Error('Path is required')

  // 範例：如果你傳 'secret.api.key'，它會變成 ['secret', 'api', 'key']。
  // secret: getConfig('secret.jwtSecret'),
  // 在你這次的例子 'secret'，陣列就是 ['secret','jwtSecret']。
  const keys = path.split('.')

  const finalValue = keys.reduce((prev, curr) => {
    const currentContainer = prev as Record<string, any>

    if (currentContainer && typeof currentContainer === 'object' && curr in currentContainer) {
      return currentContainer[curr]
    }

    throw new Error(`[ConfigManager] Path "${path}" not found (lost at "${curr}")`)
  }, config)

  // 它會把 { jwtSecret: "my_super_secret_key", ... } 丟出來。
  return finalValue as T
}
