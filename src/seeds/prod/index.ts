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

    // 💡 嚴格限制更新欄位，且必須完全符合 UserSchema 中的屬性名稱
    const updateColumns: string[] = ['name', 'age', 'role']

    // 💡 修正：使用 TypeORM 官方標準且型別完全支援的雙陣列寫法
    await manager
      .createQueryBuilder()
      .insert()
      .into(UserSchema)
      .values(productionUsers)
      .orUpdate(updateColumns, ['id']) // 第一個參數是更新欄位，第二個是衝突的主鍵
      .execute()

    console.log('📝 [Prod-Seeder] 資料庫 Upsert 執行成功')

    // ==========================================
    // 驗證最終資料
    // ==========================================
    const targetIds = productionUsers.map((user) => user.id?.toLowerCase()).filter(Boolean) as string[]

    // 💡 既然前面 Transaction 會被 Aborted，代表可能資料根本沒對齊。
    // 我們改用最乾淨的 QueryBuilder 重新查詢：
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
    // 💡 這裡非常關鍵！只要出錯立刻 Rollback，並把最原始的錯誤完整印出來
    console.error('❌ [Prod-Seeder] 發生錯誤，執行 Rollback：', error)
    await queryRunner.rollbackTransaction()
  } 
  finally {
    // 不論最後是成功 (try) 還是失敗 (catch)，都必須關閉 queryRunner 的專屬連線，
    // 把資源還給連線池 (Connection Pool)
    await queryRunner.release()
    console.log('🔌 [Seeder] 專屬連線已關閉。')
  }
}
