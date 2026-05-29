import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
// ~npm install swagger-jsdoc swagger-ui-express
// ~TS，通常會再加型別
// ~npm install -D @types/swagger-jsdoc @types/swagger-ui-express
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'localDB API 文件',
      version: '1.0.0',
      description: 'API 文件，提供了所有可用的 API 端點和使用說明。',
      contact: {
        name: '技術支援團隊',
        url: 'https://support.example.com',
        email: 'support@example.com',
      },
    },
    servers: [
      { url: 'http://localhost:8080', description: '本地開發伺服器' },
      { url: 'https://node-zeabur-postgresql.zeabur.app', description: '生產環境伺服器' },
    ],
  },
  apis: ['./src/routes/*.ts'], // 指定包含 Swagger 註解的路由文件位置,
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
export { swaggerDocs, swaggerUi }
