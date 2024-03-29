/*
  mailer.js
*/

require("dotenv").config();
const nodemailer = require("nodemailer");

var Mailer = function () {
  this.transport = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

Mailer.prototype.send = async function (subject, text) {
  const info = await this.transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: subject,
    text: text,
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = Mailer;
