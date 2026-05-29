// import { DataSource } from 'typeorm'
import { AppDataSource } from '../config/database.js'
// Schema
import { UserSchema } from '../models/UserSchema.js'
import { OrderSchema } from '../models/OrderSchema.js'
// mock 假資料
import { mockUsers } from './users.seed.js'
import { mockOrders } from './orders.seed.js'

export async function seedMockData() {
  try {
    // getRepository 是繼承自 TypeORM DataSource 類別的原生方法
    const userRepository = AppDataSource.getRepository(UserSchema)
    const orderRepository = AppDataSource.getRepository(OrderSchema)

    // 1. 寫入 Users (因爲有外鍵約束，User 必須先寫入)
    await userRepository.save(mockUsers)
    console.log('✅ Users 假資料寫入成功！')

    // 2. 寫入 Orders
    await orderRepository.save(mockOrders)
    console.log('✅ Orders 假資料寫入成功！')

    // 3. 驗證結果並印出( 實際JOIN User 資料 )
    const newOrders = await orderRepository.find({
      relations: {
        user: true, // 對應 : user: 虛擬要連結用的欄位
      } as any,
    })

    console.log('\n--- 最終產出的 Orders 帶有關聯資料 ---')
    console.log(JSON.stringify(newOrders, null, 2))
  } 
  catch (error) {
    console.error('⚠️ Seeder 執行失敗:', error)
  }
}
