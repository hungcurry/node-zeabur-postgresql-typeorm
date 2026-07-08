// import { DataSource } from 'typeorm'
import { AppDataSource, dbEntities, keepEntities } from '@/config/database.js'
// Schema
import {
  ProfileSchema,
  CategorySchema,
  // === 子表 (從表) ===
  OrderSchema,
  ProductSchema,
} from '@/models/index.js'
// mock 假資料
import { mockProfiles } from './profiles.seed.js'
import { mockCategories } from './categories.seed.js'
import { mockOrders } from './orders.seed.js'
import { mockProducts } from './products.seed.js'

/**
 * @param allEntities 所有資料庫 Entity 列表
 * @param keepEntities 即使重新啟動 Seed也要保留不予清空的白名單
 */
async function clearDatabaseTables(allEntities: any[], keepEntities: Set<any>) {
  // ==========================================
  // 🚀1.每次重新執行 Seed 時，先清空舊資料
  // 誰有 Foreign Key，誰就是(子表)（Child）: orders / products
  // ==========================================
  console.log('🧹 [Seeder] 正在透過 CASCADE 安全連鎖清空歷史資料...')

  // 要清空的 Entities
  const cleanEntities = allEntities.filter((entity) => !keepEntities.has(entity))
  // 要清空的Tables資料表
  const cleanTables = cleanEntities.map((entity) => AppDataSource.getMetadata(entity).tableName)
  console.log(`cleanTables`, cleanTables)
  // cleanTables [ 'profiles', 'orders' ]

  if (cleanTables.length === 0) {
    console.log('[Seeder] 沒有需要清空的資料表。')
    return
  }

  // 使用全域 AppDataSource 獨立執行清空 SQL，不污染後續的交易沙盒
  await AppDataSource.query(`
    TRUNCATE TABLE
      ${cleanTables.map((table) => `"${table}"`).join(', ')}
    RESTART IDENTITY CASCADE;
  `)
  console.log('🧹 [Seeder] 歷史舊資料已成功連鎖清空！')
}
export async function seedMockData() {
  /** 資料初始化
   * 執行資料庫假資料初始化 (Seeder)
   * 採用資料庫交易 (Transaction) 機制，
   * 確保資料寫入的「原子性」（要嘛全成功，要嘛全失敗）
   */

  // *執行清空舊資料
  await clearDatabaseTables(dbEntities, keepEntities)

  // 建立一個獨立的 queryRunner 連線物件
  const queryRunner = AppDataSource.createQueryRunner()
  // 讓 queryRunner 與資料庫建立實體連線
  await queryRunner.connect()
  // 啟動資料庫交易 (Transaction)
  // 啟動後，接下來所有的寫入/刪除操作都會進入「臨時沙盒」，先不對硬碟做真實改動
  await queryRunner.startTransaction()

  try {
    console.log('🚀 [Seeder] 開始開發環境預設資料...')

    // 必須用 queryRunner 提供的 manager，才能把操作鎖定在同一個 Transaction 內
    const manager = queryRunner.manager
    // (父表)
    const profileManager = manager.getRepository(ProfileSchema)
    const categoryManager = manager.getRepository(CategorySchema)
    // (子表 => 有外來鍵)
    const orderManager = manager.getRepository(OrderSchema)
    const productManager = manager.getRepository(ProductSchema)

    // ==========================================
    // 🚀2.資料寫入 💡 因爲有外鍵約束，被合併的表(父表)必須先 寫入
    // 誰有 Foreign Key，誰就是(子表)（Child）: orders / products
    // ==========================================
    // 寫入 Profiles / Categories(父表)
    // prettier-ignore
    await Promise.all([
      profileManager.save(mockProfiles), 
      categoryManager.save(mockCategories)
    ])
    console.log('✅ [Seeder] Profiles 假資料寫入成功！')
    console.log('✅ [Seeder] Categories 假資料寫入成功！')

    // 寫入 Orders / Products(子表)
    // prettier-ignore
    await Promise.all([
      orderManager.save(mockOrders), 
      productManager.save(mockProducts)
    ])
    console.log('✅ [Seeder] Orders 假資料寫入成功！')
    console.log('✅ [Seeder] Products 假資料寫入成功！')

    // 走到這一步代表以上所有 save 都完美無誤，
    // 正式通知資料庫：「把剛才沙盒裡的內容一次性寫入硬碟！」
    await queryRunner.commitTransaction()
    console.log('✨ [Seeder] 所有假資料已成功寫入並提交至資料庫！')

    // ==========================================
    // 🚀3.驗證 JOIN 結果
    // ==========================================
    // getRepository 是繼承自 TypeORM DataSource 類別的原生方法
    const profileRepository = AppDataSource.getRepository(ProfileSchema)
    // === 子表 (從表) ===
    const orderRepository = AppDataSource.getRepository(OrderSchema)
    const productRepository = AppDataSource.getRepository(ProductSchema)

    // 驗證結果並印出( 實際JOIN 資料 )
    const newOrders = await orderRepository.find({
      relations: {
        profile: true, // 對應 : profile: 虛擬要連結用的欄位
      },
    })
    // 反向
    const newProfiles = await profileRepository.find({
      relations: {
        orders: true, // 對應 : orders: 虛擬要連結用的欄位
      },
    })

    const newProducts = await productRepository.find({
      relations: {
        category: true, // 對應 : category: 虛擬要連結用的欄位
      },
    })

    console.log('\n--- 最終產出的 Orders 帶有關聯資料 ---')
    console.log(JSON.stringify(newOrders, null, 2))

    console.log('\n--- 反向映射 Profiles ---')
    console.log(JSON.stringify(newProfiles, null, 2))

    console.log('\n--- 最終產出的 Products 帶有關聯資料 ---')
    console.log(JSON.stringify(newProducts, null, 2))
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
