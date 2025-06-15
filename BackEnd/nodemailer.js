const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
});

const mailer = (message) => {
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("Email sent: ", info);
      return console.log(err);
    }
  });
};

module.exports = mailer;