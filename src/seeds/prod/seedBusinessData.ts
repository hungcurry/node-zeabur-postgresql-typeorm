import { In } from 'typeorm'
import { AppDataSource } from '@/config/database.js'
// Schema
import { SystemMetaSchema, UserSchema } from '@/models/index.js'
// seed資料
import { productionUsers } from './users.seed.js'

export async function seedBusinessData() {
  // =========================================
  // 1. 配置初始化任務清單 (未來新增只需加在這裡)
  // ==========================================
  const seedTasks = [
    {
      key: 'prod_seed_users_v1',
      description: '使用者預設資料',
      schema: UserSchema,
      data: productionUsers,
    },
    // 💡 未來有新資料，直接解開註解並加入即可：
    // {
    //   key: 'prod_seed_roles_v1',
    //   description: '權限角色預設資料',
    //   schema: RoleSchema,
    //   data: productionRoles,
    // },
  ]

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

    // ==========================================
    // 2. 核心邏輯：用迴圈動態處理所有任務
    // ==========================================
    for (const task of seedTasks) {
      // 檢查目前任務是否已經執行過
      const seedFlag = await manager.findOne(SystemMetaSchema, {
        where: { key: task.key }, // prod_seed_users_v1
      })
      if (seedFlag) {
        console.log(`🌱 [Prod-Seeder] [${task.description}] 已經執行過，跳過。`)
        continue // 跳過此任務，繼續下一個
      }

      console.log('🚀 [Prod-Seeder] 開始同步正式環境預設資料...')
      // 執行寫入該資料表
      // prettier-ignore
      await manager
        .createQueryBuilder()
        .insert()
        .into(task.schema)  // INSERT INTO users ...
        .values(task.data) // INSERT INTO users (id, name, age, role) VALUES (...)
        .execute()

      // 寫入對應的 SystemMeta 標記
      await manager
        .createQueryBuilder()
        .insert()
        .into(SystemMetaSchema)
        .values({
          key: task.key,
          value: 'done',
        })
        .execute()

      console.log(`✅ [Prod-Seeder] [${task.description}] 首次寫入成功！`)
    }

    // 走到這一步代表以上所有 save 都完美無誤，
    // 正式通知資料庫：「把剛才沙盒裡的內容一次性寫入硬碟！」
    await queryRunner.commitTransaction()
    console.log('✨ [Prod-Seeder] 所有初始化任務同步成功！')

    // ==========================================
    // 驗證最終資料
    // ==========================================
    // getRepository 是繼承自 TypeORM DataSource 類別的原生方法
    // (父表) userRepository只是連線操作器,沒有資料
    const userRepository = AppDataSource.getRepository(UserSchema)
    const currentProdUsers = await userRepository.find()

    console.log('\n--- 正式環境 商業邏輯資料 ---')
    // ⚠️ 注意：在雲端環境（如 Zeabur）正式日誌中，請避免使用 JSON.stringify(..., null, 2) 的多行美化排版。
    // 因為雲端日誌收集器採非同步按行抓取，多行輸出極容易因事件交錯（Race Condition）導致內容被截斷或吃掉。
    // 正式環境請一律改用下方「單行輸出」以確保日誌完整性。
    if (isDev) {
      console.log(JSON.stringify(currentProdUsers, null, 2))
    }
    if (isProd) {
      console.log(`📊 [Prod-Seeder] : ${JSON.stringify(currentProdUsers[0])}`)
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
