import { In } from 'typeorm'
import { AppDataSource } from '@/config/database.js'
// Schema
import { RoleSchema } from '@/models/index.js'
// seed資料
import { systemRoles } from './roles.seed.js'

export async function seedSystemData() {
  // 建立一個獨立的 queryRunner 連線物件
  const queryRunner = AppDataSource.createQueryRunner()
  // 讓 queryRunner 與資料庫建立實體連線
  await queryRunner.connect()
  // 啟動資料庫交易 (Transaction)
  // 啟動後，接下來所有的寫入/刪除操作都會進入「臨時沙盒」，先不對硬碟做真實改動
  await queryRunner.startTransaction()

  const isDev = process.env.NODE_ENV === 'development'
  const isProd = process.env.NODE_ENV === 'production'

  try {
    // 必須用 queryRunner 提供的 manager，才能把操作鎖定在同一個 Transaction 內
    const manager = queryRunner.manager
    console.log('🚀 [Prod-Seeder] 開始同步正式環境預設資料...')

    // 自動取得所有要更新的欄位
    // 排除主鍵 id，避免更新主鍵
    const updateColumns = Object.keys(systemRoles[0]!).filter((column) => column !== 'id')
    // console.log(`updateColumns`, updateColumns)
    // updateColumns [ 'name', 'description' ]

    // Upsert：
    // - id 不存在 → INSERT
    // - id 已存在 → UPDATE updateColumns 指定的欄位
    await manager
      .createQueryBuilder()
      .insert()
      .into(RoleSchema) // INSERT INTO roles ...
      .values(systemRoles) // INSERT INTO roles (id, name, description) VALUES (...)
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
    // (父表) roleRepository只是連線操作器,沒有資料
    const roleRepository = AppDataSource.getRepository(RoleSchema)
    // 直接查詢整張表
    // const currentProdRoles = await roleRepository.findMany()

    const currentProdRoles = await roleRepository.find({
      // [
      //   { id: "A" },
      //   { id: "B" }
      // ]
      // 解析 WHERE id IN ('A', 'B')
      where: {
        // 只查詢 systemRoles 的三筆id，避免查到其他非預設資料
        id: In(systemRoles.map((role) => role.id)),
      },
    })

    console.log('\n--- 正式環境 系統邏輯資料 ---')
    // ⚠️ 注意：在雲端環境（如 Zeabur）正式日誌中，請避免使用 JSON.stringify(..., null, 2) 的多行美化排版。
    // 因為雲端日誌收集器採非同步按行抓取，多行輸出極容易因事件交錯（Race Condition）導致內容被截斷或吃掉。
    // 正式環境請一律改用下方「單行輸出」以確保日誌完整性。
    if (isDev) {
      console.log(JSON.stringify(currentProdRoles, null, 2))
    }
    if (isProd) {
      console.log(`📊 [Prod-Seeder] : ${JSON.stringify(currentProdRoles[0])}`)
    }
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
