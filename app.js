require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const {getEmployers} = require("./db");
const { importData, validateFile } = require('./csvImporter'); // Правильный импорт
const { sendEmail } = require("./mailer");

const app = express();
// Processing static files (index.html)
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" }); //settings for file upload

// settings transport for email sending
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "banatovskaya@gmail.com",
    pass: process.env.EMAIL_PASSWORD, 
  },
});

// Processing a request to send a letter
app.post("/send-email", upload.single("fileCV"), async(req, res) => {
  const getEmployersPromise = getEmployers;
  const { email } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Файл не загружен" });
  }
  try {
    await sendEmail(transporter, email, file, getEmployersPromise);
    res.status(200).json({ message: "Письмо успешно отправлено!" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при отправке письма" });
  }
  
});

app.post("/load-employers", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    validateFile(file);  

    await importData(file.path); 

    res.status(200).json({ message: "Данные успешно импортированы в базу данных!" });
  } catch (error) {
    console.error("Ошибка при импорте данных:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = app;
