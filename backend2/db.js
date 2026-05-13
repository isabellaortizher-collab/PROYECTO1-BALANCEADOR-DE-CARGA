import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "blog_db",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

pool
  .getConnection()
  .then((conn) => {
    console.log("✅ MySQL conectado com sucesso");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Falha ao conectar no MySQL:", err.message);
    console.error("Verifique seu arquivo .env e se o XAMPP está rodando.");
    process.exit(1);
  });

export default pool;
