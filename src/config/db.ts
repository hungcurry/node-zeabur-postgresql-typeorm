const db = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  database: process.env.DB_DATABASE,
  databaseUrl: process.env.DATABASE_URL,
}

export default db
