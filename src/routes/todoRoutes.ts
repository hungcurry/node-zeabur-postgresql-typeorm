import { Router } from 'express'
// 使用解構賦值匯入 Controller 函式
import { 
  handleGetTodos, 
  handleCreateTodo, 
  handleUpdateTodo, 
  handleDeleteTodo,
} from '../controllers/todoController.js'

const router = Router()

/**
 * 路由掛載
 * 備註：前綴 /todos 已在 app.ts 中定義
 */

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: 使用 本地開發伺服器
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: Todo ID
 *           example: "661f0c2f8f1b2a0012345678"
 *         title:
 *           type: string
 *           description: Todo 標題
 *           example: "Buy milk"
 *         completed:
 *           type: boolean
 *           description: 是否完成
 *           example: false
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: 取得所有 Todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: 成功取得列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/', handleGetTodos)

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: 建立新的 Todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Learn Swagger"
 *               completed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: 建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
router.post('/', handleCreateTodo)

/**
 * @swagger
 * /todos/{id}:
 *   patch:
 *     summary: 更新 Todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
router.patch('/:id', handleUpdateTodo)

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: 刪除 Todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: 刪除成功
 */
router.delete('/:id', handleDeleteTodo)

export default router
