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
    // 必須用 queryRunner 提供的 manager，才能把操作鎖定在同一個 Transaction 內
    const manager = queryRunner.manager
    console.log('🚀 [Prod-Seeder] 開始同步正式環境預設資料...')
    console.log('📦 [Prod-Seeder] 檢查 productionUsers 原始資料:', JSON.stringify(productionUsers))

    // 自動取得所有要更新的欄位
    // 排除主鍵 id，避免更新主鍵
    const updateColumns = Object.keys(productionUsers[0]!).filter((column) => column !== 'id')
    // console.log(`updateColumns`, updateColumns)
    // updateColumns [ 'name', 'age', 'role' ]

    // Upsert：
    // - id 不存在 → INSERT
    // - id 已存在 → UPDATE updateColumns 指定的欄位
    await manager
      .createQueryBuilder()
      .insert()
      .into(UserSchema) // INSERT INTO users ...
      .values(productionUsers) // INSERT INTO users (id, name, age, role) VALUES (...)
      .orUpdate(updateColumns, ['id']) // 如果 id 衝突（已存在），就更新這些欄位
      .execute()

    // 走到這一步代表以上所有 save 都完美無誤，
    // 正式通知資料庫：「把剛才沙盒裡的內容一次性寫入硬碟！」
    await queryRunner.commitTransaction()
    console.log('✨ [Prod-Seeder] 預設資料同步成功！')

    // ==========================================
    // 驗證最終資料
    // ==========================================
    // getRepository 是繼承自 TypeORM DataSource 類別的原生方法
    // (父表) userRepository只是連線操作器,沒有資料
    const userRepository = AppDataSource.getRepository(UserSchema)

    const currentProdUsers = await userRepository.find({
      // [
      //   { id: "A" },
      //   { id: "B" }
      // ]
      // 解析 WHERE id IN ('A', 'B')
      where: {
        id: In(productionUsers.map((user) => user.id)),
      },
    })

    console.log('\n--- 正式環境 預設資料 ---')
    console.log(`📊 [Prod-Seeder] 當前資料庫資料: ${JSON.stringify(currentProdUsers)}`)
    console.log(JSON.stringify(currentProdUsers, null, 2))
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
