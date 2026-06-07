import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  password: "DrishtiBitsH@23",
  host: "localhost",
  port: 5432,
  database: "expense_tracker",
});

pool.connect()
  .then(() => console.log("Connected Successfully"))
  .catch(err => console.log(err));
  

export default pool;