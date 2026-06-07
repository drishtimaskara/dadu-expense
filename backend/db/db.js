import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
  


pool.connect()
  .then(() => console.log("DB connected successfully"))
  .catch(err => console.log("DB connection error:", err));

export default pool;
