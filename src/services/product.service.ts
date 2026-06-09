// Service 層只專注於資料庫操作
import { AppDataSource } from '@/config/database.js'
import { ProductSchema } from '@/models/ProductSchema.js'
import type { TCreateProductInput } from '../zod/ProductZod.js' // 👈 引入剛才定義的型別

export const getProducts = async () => {
  // 直接撈出所有商品，不帶任何不存在的欄位排序
  const productRepository = await AppDataSource.getRepository(ProductSchema)

  // 會拿到一個陣列，即使只有一筆資料也是陣列
  // TypeORM 用法：find() 相當於 Prisma 的 findMany()
  const products = await productRepository.find()
  console.log('products:', products)

  return products
}

export const createProduct = async (data: TCreateProductInput) => {
  const isExist = await AppDataSource.getRepository(ProductSchema).findOne({ where: { title: data.title } })
  if (isExist) throw new Error('商品名稱已存在')

  const productRepository = await AppDataSource.getRepository(ProductSchema)
  // 會拿到單一物件
  // TypeORM 用法：先 create 建立實例，再用 save 寫入資料庫
  const productInstance = productRepository.create(data)
  const savedProduct = await productRepository.save(productInstance)

  return savedProduct
}
