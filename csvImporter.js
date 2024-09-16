const csvtojson = require("csvtojson");
const fs = require("fs");
const { pool } = require("./db");

const importData = async (filePath) => {
  const client = await pool.connect();
  try {
    const employers = await csvtojson({
      delimiter: ";",
    }).fromFile(filePath);

    for (let employer of employers) {
      const query = `
        INSERT INTO employer (company_name, email) 
        VALUES ($1, $2)
        ON CONFLICT (company_name) 
        DO UPDATE SET email = EXCLUDED.email;
      `;

      await client.query(query, [employer.company_name, employer.email]);
    }

    console.log("Данные успешно экспортированы в PostgreSQL");
  } catch (err) {
    console.error("Ошибка при экспорте данных:", err);
    throw err; 
  } finally {
    client.release();  
    console.log("Подключение освобождено");
    try {
      fs.unlinkSync(filePath);
      console.log("Файл успешно удален");
    } catch (unlinkError) {
      console.error("Ошибка при удалении файла:", unlinkError);
    }
  }
};

const validateFile = (file) => {
  if (!file) {
    throw new Error("Файл csv не загружен");
  }

  const fileExtension = file.originalname.split(".").pop().toLowerCase();
  if (fileExtension !== "csv") {
    throw new Error("Неверный формат файла. Пожалуйста, загрузите файл CSV.");
  }
};

module.exports = {
  importData,
  validateFile,
};
