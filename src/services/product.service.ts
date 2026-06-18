// Service 層只專注於資料庫操作
import { AppDataSource } from '@/config/database.js'
// Schema
import { CategorySchema } from '@/models/CategorySchema.js'
import { ProductSchema } from '@/models/ProductSchema.js'
// type
import type { TCreateProductInput, TUpdateProductInput } from '../zod/ProductZod.js'

const DEFAULT_CATEGORY_NAME = '其他'

// 透過 Arrow Function 建立延遲求值（Lazy Evaluation）捷徑
// 能避免測試環境 Import 時因連線未初始化而噴錯
// getRepository 是繼承自 TypeORM DataSource 類別的原生方法
const getCategoryRepo = () => AppDataSource.getRepository(CategorySchema)
const getProductRepo = () => AppDataSource.getRepository(ProductSchema)

/** TypeORM 和 Prisma 關聯方式
 *
 * 🔵 TypeORM 關聯方式
 * `category: foundCategory`          => Entity 本身就是關聯，`save()` 會取出 `id` 更新 FK
 * `category_id: categoryData.id`     => 只建立關聯參考，不必查完整 Entity
 *
 * 🟢 Prisma 關聯方式
 * `category: Entity 物件`            => ❌ 不行 Prisma 不接受直接指定 relation 物件
 * `category: { connect: { id } }`    => Entity 本身就是關聯，`save()` 會取出 `id` 更新 FK
 *
 */
export const getProducts = async () => {
  const productRepository = getProductRepo()
  // TypeORM 用法：find() 相當於 Prisma 的 findMany()
  const newProducts = await productRepository.find({
    // 🎯 關鍵在這裡：主動宣告你要的欄位 (去掉 外來鍵)
    // SELECT id, title, price, stock FROM products ...
    select: {
      id: true,
      title: true,
      price: true,
      stock: true,
      createdAt: true,
      updatedAt: true,
      // 只選取 API 需要回傳的欄位
      // category_id 與 id 不會出現在最終回傳結果中
      // ----------
      // category_id : true,
      category: {
        // id: true,
        name: true,
      },
    },
    order: {
      // DESC : 從大到小 最新到最舊 (例如：2026年 > 2025年)
      // ASC  : 從小到大 最舊到最新 (例如：2025年 < 2026年)
      createdAt: 'DESC',
    },
    relations: {
      category: true,
    },
  })

  console.log('\n--- 回傳前端 Products 帶有關聯資料 ---')
  console.log(JSON.stringify(newProducts, null, 2))

  return newProducts
  // --- 回傳前端 Products 帶有關聯資料 ---
  // [
  //   {
  //     "id": "f68089ce-5aac-4ded-aef8-d26bd5ddb2d0",
  //     "title": "極致黑人體工學椅",
  //     "price": 5800,
  //     "stock": 15,
  //     "createdAt": "2026-06-16T07:03:06.725Z",
  //     "updatedAt": "2026-06-16T07:03:06.725Z",
  //     "category": {
  //       "name": "電子產品"
  //     }
  //   }
  // ]
}
export const createProduct = async (data: TCreateProductInput) => {
  const isExist = await getProductRepo().findOne({ where: { title: data.title } })
  if (isExist) throw new Error('商品名稱已存在')

  const categoryRepository = getCategoryRepo()
  const productRepository = getProductRepo()

  // 1. 兩種邏輯判別（核心改動）：
  // 如果前端「有傳」data.category ➡️ 變數 category 就會是前端傳的值（如 '電子產品'）
  // 如果前端「沒傳」data.category ➡️ 變數 category 就會自動變成預設值 '其他'
  const { category = DEFAULT_CATEGORY_NAME, ...productData } = data

  // 2. 動態去分類表（categories）查詢對應的 ID
  const categoryData = await categoryRepository.findOne({ where: { name: category } })
  // categoryData { id: '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e', name: '其他' }
  console.log('categoryData', categoryData)

  // 3. 防禦性檢查：防止前端傳了亂寫的分類（如 '哈利波特'），或者資料庫漏建了 '其他' 分類
  if (!categoryData) {
    throw new Error(`系統內找不到名為 '${category}' 的分類，請先至後台建立該分類`)
  }

  // #region relations 映射說明
  // ---------------------
  // TypeORM 在背後會自己去抓 categoryData.id，然後自動幫你寫入外鍵（Foreign Key）
  // 丟進去的這一刻，TypeORM 開始拿著你的 EntitySchema 設定檔去對照 dbPayload
  // await productRepository.save(productInstance)
  // ----------
  // 1. 看到 payload 有 "category"，轉頭對照 relations設定的 虛擬欄位
  // 2. 如果看到 category屬性，請去拿它裡面的 referencedColumnName（也就是 id）
  // 3. TypeORM 伸手進去你的物件裡，把 "6b4f2c91-..." 塞進實體欄位 "category_id"
  //
  // 最終結果：建立實體欄位 "category_id"
  // products.category_id = '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e'
  // ---------------------
  // #endregion
  const dbPayload = {
    ...productData, // 包含 title, price, stock
    // ~1.寫FK方式 : 比較直觀
    // category_id: categoryData.id, // 寫入動態查到的資料庫 ID

    // ~2.寫relations映射
    // dbPayload {
    //   title: '極致黑人體工學椅77',
    //   price: 5800,
    //   stock: 15,
    //   category: { id: '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e', name: '其他' }
    // }
    category: categoryData,
  }
  // console.log('dbPayload', dbPayload)

  // 4. 組裝真正要寫入資料庫的資料物件
  //------------------------------------
  // 🔵 TypeORM 寫法：兩步走（物件導向類別實例化）
  // 先 create 建立實例，再用 save 寫入資料庫
  // const instance = repo.create({ ... })
  // await repo.save(instance)

  // 🟢 Prisma 寫法：一步到位（Query Builder 導向）
  // await prisma.product.create({ data: { ... } })
  //------------------------------------
  const productInstance = productRepository.create(dbPayload)
  const savedProduct = await productRepository.save(productInstance)

  return savedProduct
  // 🟢 category 這物件不會真的存到資料庫..
  // savedProduct {
  //   title: '極致黑人體工學椅33',
  //   price: 5800,
  //   stock: 15,
  //   category_id: '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e',
  //   category: { id: '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e', name: '其他' },
  //   id: '038a7afc-0e9c-424a-97d2-d74fd72ad865',
  //   createdAt: 2026-06-17T07:09:39.681Z,
  //   updatedAt: 2026-06-17T07:09:39.681Z
  // }
}
export const updateProduct = async (id: string, data: TUpdateProductInput) => {
  const categoryRepository = getCategoryRepo()
  const productRepository = getProductRepo()

  // 1. 檢查商品是否存在
  const productInstance = await productRepository.findOne({
    where: { id },
    relations: { category: true },
  })
  if (!productInstance) throw new Error('商品不存在')
  // #region productInstance
  // console.log(`productInstance` , productInstance)
  // productInstance {
  //   id: '791168af-7032-4aff-ab3c-2cf1fe8c8ad0',
  //   title: '極致黑人體工學椅33',
  //   price: 6200,
  //   stock: 20,
  //   createdAt: 2026-06-17T01:43:54.056Z,
  //   updatedAt: 2026-06-17T06:16:28.521Z,
  //   category_id: '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e',
  //   category: { id: '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e', name: '其他' }
  // }
  // #endregion

  // 2. 檢查商品名稱是否與「其他商品」重複
  if (data.title) {
    const product = await productRepository.findOne({ where: { title: data.title } })
    // console.log(`product`, product)
    if (product && product.id !== id) {
      throw new Error('商品名稱已存在')
    }
  }

  // 3. 處理分類關聯變更
  // productInstance.category: { id: '6b4f2c91-8a3d-4c7b-9e52-1f8a6c3b0d4e', name: '其他' }
  const { category: categoryName, ...productData } = data
  // 先沿用原本的 Category，只有有傳新的 category 才覆蓋
  let oldCategory = productInstance.category

  // 如果前端有傳入新的 category 欄位，才進行動態查詢切換
  if (categoryName !== undefined) {
    const trimCategoryName = categoryName.trim()
    if (trimCategoryName === '') {
      throw new Error('商品分類不可為空')
    }

    const foundCategory = await categoryRepository.findOne({
      where: { name: trimCategoryName },
    })
    if (!foundCategory) {
      throw new Error(`系統內找不到名為 '${trimCategoryName}' 的分類，請先至後台建立該分類`)
    }
    oldCategory = foundCategory
  }

  // 4. 更新並自動處理 updatedAt
  // #region 更新
  // 如果用 update()
  // -------
  // 特性 1：不會觸發 TypeORM 生命週期與裝飾器，必須手動補上 updatedAt: new Date()
  // 特性 2：不吃巢狀物件！category 只能給含有 ID 的扁平物件或是 categoryId 欄位（依你的 Entity 定義為準）
  // 特性 3：update() 的回傳值是 UpdateResult（例如：{ affected: 1 }），不是商品物件！
  // 如果前端需要看到更新後的商品資料，你必須「再撈一次」資料庫：
  // -------
  // await productRepository.update(id, {
  //   ...productData,                     // 只有 title, price, stock 等純文字/數字
  //   category_id: categoryData?.id,      // 傳入只帶 ID 的關聯物件（對應資料庫的外鍵 id）
  //   updatedAt: new Date()               // 必須手動傳入 Date 物件
  // });
  // const savedProduct = await productRepository.findOne({
  //   where: { id },
  //   relations: { category: true }
  // })
  // if (!savedProduct) throw new Error('更新後查詢商品失敗')

  // -----------------------

  // 如果用 save() 自動更新 updatedAt
  // 使用 Object.assign 將新欄位更新到原本的實例上
  // -------
  // 特性 1：因為 productInstance 帶有 id，TypeORM 會自動去執行 UPDATE 語句
  // 特性 2：會自動觸發 @UpdateDateColumn，我們不用手動去塞時間
  // 特性 3：回傳值是「更新成功後的完整商品物件」（包含新時間、完整的關聯分類物件）
  // -------
  // #endregion

  // 直接在原來的實例上修改屬性
  Object.assign(productInstance, {
    ...productData,
    category: oldCategory,
  })
  const updatedProduct = await productRepository.save(productInstance)

  return updatedProduct
}
