const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "employers_db",
  password: process.env.BD_PASSWORD,
  port: 5432,
});

async function getEmployers() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM employer");
    console.log("отримано з бази ДБ", res.rows);
    return res;
  } catch (err) {
    console.error("Ошибка выполнения запроса", err.stack);
  } finally {
    client.release();  //turn connect to the pool
    console.log("Подключение освобождено");
  }
}

module.exports = {
  getEmployers,
  pool
};
