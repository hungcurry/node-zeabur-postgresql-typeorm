import { In } from 'typeorm'
import { AppDataSource } from '@/config/database.js'
// Schema
import { UserSchema } from '@/models/UserSchema.js'
// seed資料
import { productionUsers } from './users.seed.js'

export async function seedProdData() {
  // 建立一個獨立的 queryRunner 連線物件
  const queryRunner = AppDataSource.createQueryRunner()
  // 讓 queryRunner 與資料庫建立實體連線
  await queryRunner.connect()
  // 啟動資料庫交易 (Transaction)
  // 啟動後，接下來所有的寫入/刪除操作都會進入「臨時沙盒」，先不對硬碟做真實改動
  await queryRunner.startTransaction()

  try {
    const manager = queryRunner.manager

    console.log('🚀 [Prod-Seeder] 開始同步正式環境預設資料...')
    console.log('📦 [Prod-Seeder] 檢查 productionUsers 原始資料:', JSON.stringify(productionUsers))

    if (!productionUsers || productionUsers.length === 0) {
      console.log('⚠️ [Prod-Seeder] 警告：偵測到 productionUsers 為空，跳過執行。')
      await queryRunner.rollbackTransaction()
      return
    }

    // 💡 確保欄位名稱完全貼合資料庫
    const updateColumns = ['name', 'age', 'role']

    const result = await manager
      .createQueryBuilder()
      .insert()
      .into(UserSchema)
      .values(productionUsers)
      .orUpdate(updateColumns, ['id'])
      .execute()

    // 💡 修正後的 Log 寫法
    console.log('📝 [Prod-Seeder] Upsert raw 影響列數:', result.raw?.length)
    console.log('📝 [Prod-Seeder] 資料庫 Upsert 執行結果 identifiers:', JSON.stringify(result.identifiers))

    // ==========================================
    // 驗證最終資料
    // ==========================================
    const targetIds = productionUsers.map((user) => user.id).filter(Boolean) as string[]

    // 💡 關鍵排查：直接全表掃描，看看到底是有資料但查不到，還是根本沒塞進去！
    const debugAllUsers = await manager.find(UserSchema)
    console.log('\n--- 🔍 [Debug] 目前資料表內的全部資料 ---')
    console.log(JSON.stringify(debugAllUsers, null, 2))

    const currentProdUsers = await manager
      .createQueryBuilder(UserSchema, 'user')
      .where('user.id IN (:...targetIds)', { targetIds })
      .getMany()

    console.log('\n--- 正式環境 預設資料 (Transaction 內確認) ---')
    console.log(JSON.stringify(currentProdUsers, null, 2))

    await queryRunner.commitTransaction()
    console.log('✨ [Prod-Seeder] 預設資料同步成功！')
  } 
  catch (error) {
    // 中間只要任何一個步驟噴錯（不論是寫入失敗、格式不對或網路斷線），就會立刻跳到這裡。
    // 告訴資料庫：「剛剛臨時沙盒裡的紀錄全部撕掉，裝作沒發生過！」確保資料庫不會留下半殘的髒資料。
    await queryRunner.rollbackTransaction()
    console.error('⚠️ [Seeder] 執行失敗，錯誤原因:', error)
  } 
  finally {
    // 不論最後是成功 (try) 還是失敗 (catch)，都必須關閉 queryRunner 的專屬連線，
    // 把資源還給連線池 (Connection Pool)
    await queryRunner.release()
    console.log('🔌 [Seeder] 專屬連線已關閉。')
  }
}
