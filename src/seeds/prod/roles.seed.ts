import type { TRole } from '../../models/RoleSchema.js'

/**
 * 正式環境所需的基礎系統資料
 * UUID 採用固定值，確保跨環境與多次執行時的一致性
 */
export const systemRoles: TRole[] = [
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    name: 'Admin',
    description: 'System Administrator',
    is_system: true,
  },
  {
    id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
    name: 'Manager',
    description: 'Manager',
    is_system: true,
  },
  {
    id: '3d9b6bcd-cbfd-4b2d-9b5d-cb8dfbbd4bfe',
    name: 'User',
    description: 'General User',
    is_system: true,
  },
]
