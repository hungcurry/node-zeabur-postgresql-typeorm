import type { TOrder } from '../models/OrderSchema.js'

export const mockOrders: TOrder[] = [
  { id: 101, user_id: 1, amount: 500 },
  { id: 102, user_id: 2, amount: 300 },
]
