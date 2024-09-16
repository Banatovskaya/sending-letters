const path = require("path");
const fs = require("fs");

const sendEmail = async (transporter, email, file, listPromise) => {
  const attachments = [
    {
      filename: file.originalname,
      path: path.join(__dirname, file.path),
      contentType: file.mimetype,
    },
  ];

  try {
    const res = await listPromise(); 
    const employers = res.rows;
    if (!res || !res.rows || res.rows.length === 0) {
      throw new Error("Данные из базы данных не получены или пусты.");
    }

    const emailPromises = employers.map((employer) => {
      const mailOptions = {
        from: "your-email@gmail.com",
        to: employer.email,
        subject: "Junior Front-End Developer CV",
        html: `
          <p>Шановна команда з підбору персоналу компанії <strong>${employer.company_name}</strong>!</p>
          <p>Я пишу, щоб висловити свою зацікавленість на посаді Junior Front-End Developer. Маючи три місяці комерційного досвіду та більше року досвіду розробки, я з ентузіазмом ставлюся до можливості зробити свій внесок у вашу команду.</p>
          <p>У мій набір технічних навичок входять:</p>
          <ul>
            <li>JavaScript</li>
            <li>React + Redux</li>
            <li>TypeScript</li>
            <li>REST API</li>
            <li>Angular</li>
          </ul>
          <p>Додаю своє CV та посилання на репозиторій 
          <a href="https://github.com/banatovskaya" target="_blank">GitHub</a>.</p>
        `,
        attachments,
      };

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Ошибка при отправке письма:", error);
            return reject(error);
          }
          resolve(info);
        });
      });
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error("Ошибка при отправке писем:", error);
    throw error; 
  } finally {
    fs.unlinkSync(file.path); 
  }
};

module.exports = {
  sendEmail,
};
