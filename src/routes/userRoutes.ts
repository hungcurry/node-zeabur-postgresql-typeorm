import { Router } from 'express'
// 使用解構賦值匯入 Controller 函式
import { 
  handleGetUsers,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
} from '../controllers/userController.js'

const router = Router()

/**
 * 路由掛載
 * 備註：前綴 /users 已在 app.ts 中定義
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 使用 生產環境伺服器
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: 使用者 ID
 *           example: "661f0c2f8f1b2a0012345678"
 *         name:
 *           type: string
 *           description: 姓名
 *           example: "王小明"
 *         age:
 *           type: integer
 *           description: 年齡
 *           example: 30
 *         role:
 *           type: string
 *           description: 角色
 *           example: "admin"
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 取得所有使用者
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成功取得使用者列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', handleGetUsers)

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 建立新使用者
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "王小明"
 *               age:
 *                 type: integer
 *                 example: 30
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: 建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/', handleCreateUser)

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: 更新使用者
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用者 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch('/:id', handleUpdateUser)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 刪除使用者
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 使用者 ID
 *     responses:
 *       200:
 *         description: 刪除成功
 */
router.delete('/:id', handleDeleteUser)

export default router
