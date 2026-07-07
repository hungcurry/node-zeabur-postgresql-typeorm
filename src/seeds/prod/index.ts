import { seedBusinessData } from './seedBusinessData.js'
import { seedSystemData } from './seedSystemData.js'

export async function seedProdData() {
  // * 商業邏輯
  // 正式環境部署後僅在首次啟動時執行初始化寫入，此後允許使用者透過 API 自由進行修改與刪除。
  await seedBusinessData() 

  // * 系統邏輯
  // 後端完全封鎖所有 C/U/D 路由，前端僅具唯讀權限R（僅開放 GET）。
  // 權限帳號Admin/Manager/User，永遠不能消失,且每次重整三筆資料完好如初。
  await seedSystemData()
}
