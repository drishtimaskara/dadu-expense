import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
   ssl: {
  rejectUnauthorized: false,
}
  
});

pool.connect()
  .then(() => console.log("DB connected successfully"))
  .catch(err => console.log("DB connection error:", err));

export default pool;