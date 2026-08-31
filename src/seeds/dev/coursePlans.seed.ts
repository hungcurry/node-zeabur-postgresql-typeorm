import type { TCoursePlan } from '../../models/index.js'

export const mockCoursePlans: TCoursePlan[] = [
  {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    name: '7 堂組合包方案',
    credit_amount: 7,
    price: 1400,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e',
    name: '14 堂組合包方案',
    credit_amount: 14,
    price: 2520,
    created_at: new Date('2026-01-02T00:00:00.000Z'),
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f',
    name: '21 堂組合包方案',
    credit_amount: 21,
    price: 4800,
    created_at: new Date('2026-01-03T00:00:00.000Z'),
  },
]
